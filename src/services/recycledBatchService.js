const { recycledBatchModel } = require('../models/recycledBatchModel');
const { getPool } = require('../config/db');
const crypto = require('crypto');
const {
  getUsedQuantityForBatch,
  syncRecycledBatchProcessedStatus,
} = require('./recycledBatchQuantityService');

function generateBatchNo() {
  const d = new Date();
  const y = String(d.getFullYear());
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `RB-${y}${m}${day}-${rand}`;
}

async function enrichBatchRow(row) {
  if (!row) return row;
  const used = await getUsedQuantityForBatch(row.id);
  const q = row.quantity == null ? 0 : Number(row.quantity);
  row.used_quantity = used;
  row.remaining_quantity = Math.max(0, q - used);
  return row;
}

const recycledBatchService = {
  async list(opts) {
    const rows = await recycledBatchModel.list(opts);
    for (const r of rows) {
      await enrichBatchRow(r);
    }
    return rows;
  },
  async listAll() {
    const rows = await recycledBatchModel.listAll();
    for (const r of rows) {
      await enrichBatchRow(r);
    }
    return rows;
  },
  getById: (...args) => recycledBatchModel.getById(...args),
  async create(data) {
    const payload = { ...data };
    if (!payload.batch_no) payload.batch_no = generateBatchNo();
    // 進貨建立時一律為「待處理」，由處理紀錄扣量後自動更新
    payload.processed_status = 'pending';
    return recycledBatchModel.create(payload);
  },
  async update(id, data) {
    const payload = { ...data };
    delete payload.batch_no;
    delete payload.processed_status;
    if (payload.quantity !== undefined) {
      const batch = await recycledBatchModel.getById(id);
      if (!batch) throw new Error('找不到回收批次');
      const used = await getUsedQuantityForBatch(id);
      if (Number(payload.quantity) < used) {
        throw new Error(`回收數量不可小於已用於處理的合計（${used}）`);
      }
    }
    const out = await recycledBatchModel.update(id, payload);
    await syncRecycledBatchProcessedStatus(id);
    return out;
  },
  /**
   * 刪除回收批次：依外鍵順序一併刪除關聯的用料鏈結、材料批次、處理紀錄與文件索引。
   */
  async remove(id) {
    const batchId = Number(id);
    if (!Number.isFinite(batchId)) throw new Error('無效的回收批次 ID');

    const pool = await getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [mbRows] = await conn.query(
        `SELECT id FROM material_batches
         WHERE source_recycled_batch_id = ?
            OR processing_record_id IN (
              SELECT id FROM processing_records WHERE recycled_batch_id = ?
            )`,
        [batchId, batchId]
      );
      const mbIds = mbRows.map((r) => r.id);

      const [prRows] = await conn.query(
        'SELECT id FROM processing_records WHERE recycled_batch_id = ?',
        [batchId]
      );
      const prIds = prRows.map((r) => r.id);

      if (mbIds.length > 0) {
        const ph = mbIds.map(() => '?').join(',');
        await conn.query(`DELETE FROM product_batch_material_batches WHERE material_batch_id IN (${ph})`, mbIds);
        await conn.query(
          `DELETE FROM documents WHERE target_type = 'material_batch' AND target_id IN (${ph})`,
          mbIds
        );
        await conn.query(`DELETE FROM material_batches WHERE id IN (${ph})`, mbIds);
      }

      if (prIds.length > 0) {
        const ph = prIds.map(() => '?').join(',');
        await conn.query(
          `DELETE FROM documents WHERE target_type = 'processing_record' AND target_id IN (${ph})`,
          prIds
        );
      }

      await conn.query('DELETE FROM processing_records WHERE recycled_batch_id = ?', [batchId]);
      await conn.query(
        "DELETE FROM documents WHERE target_type = 'recycled_batch' AND target_id = ?",
        [batchId]
      );
      const [del] = await conn.query('DELETE FROM recycled_batches WHERE id = ?', [batchId]);

      await conn.commit();
      return { affectedRows: del.affectedRows };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};

module.exports = { recycledBatchService };
