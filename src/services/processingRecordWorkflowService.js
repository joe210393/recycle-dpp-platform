const crypto = require('crypto');
const { getPool } = require('../config/db');
const {
  getUsedQuantityForBatch,
  syncRecycledBatchProcessedStatus,
} = require('./recycledBatchQuantityService');

function generateProcessNo() {
  const d = new Date();
  const y = String(d.getFullYear());
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `PR-${y}${m}${day}-${rand}`;
}

function generateMaterialCode() {
  const d = new Date();
  const y = String(d.getFullYear());
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `MAT-${y}${m}${day}-${rand}`;
}

function generateMaterialBatchNo() {
  const d = new Date();
  const y = String(d.getFullYear());
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `MB-${y}${m}${day}-${rand}`;
}

/**
 * Express 可能把 material_lines 解析成 {0:{},1:{}}，轉成陣列
 */
function parseMaterialLines(body) {
  let raw = body.material_lines;
  if (!raw) return [];
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    raw = Object.keys(raw)
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => raw[k]);
  }
  if (!Array.isArray(raw)) return [];

  const out = [];
  for (const l of raw) {
    if (!l || typeof l !== 'object') continue;
    const q =
      l.quantity_produced != null && l.quantity_produced !== ''
        ? Number(l.quantity_produced)
        : NaN;
    if (Number.isNaN(q) || q <= 0) continue;

    const mid =
      l.material_id != null && String(l.material_id).trim() !== ''
        ? String(l.material_id).trim()
        : '';
    if (!mid) {
      throw new Error('有填寫產出數量時，請選擇材料或「新增新材料」並填寫名稱');
    }
    if (mid === 'new') {
      const nm = l.new_material_name ? String(l.new_material_name).trim() : '';
      if (!nm) throw new Error('選擇「新增新材料」時請填寫材料名稱');
    }
    out.push({
      material_id: mid,
      new_material_name: l.new_material_name ? String(l.new_material_name).trim() : '',
      category: l.category ? String(l.category).trim() : '',
      description: l.description ? String(l.description).trim() : '',
      internal_note: l.internal_note ? String(l.internal_note).trim() : '',
      quantity_produced: q,
    });
  }
  return out;
}

async function insertNewMaterial(conn, line) {
  const code = generateMaterialCode();
  const [result] = await conn.query(
    `INSERT INTO materials (name, code, category, description, is_recycled_material, public_description, internal_note, status)
     VALUES (?, ?, ?, ?, 1, NULL, ?, 'active')`,
    [
      line.new_material_name,
      code,
      line.category || null,
      line.description || null,
      line.internal_note || null,
    ]
  );
  return result.insertId;
}

async function resolveMaterialId(conn, line) {
  if (line.material_id && line.material_id !== 'new') {
    const [rows] = await conn.query('SELECT id FROM materials WHERE id = ? LIMIT 1', [
      line.material_id,
    ]);
    if (!rows.length) throw new Error(`找不到材料 ID：${line.material_id}`);
    return Number(rows[0].id);
  }
  if (!line.new_material_name) {
    throw new Error('請為每筆產出選擇既有材料，或填寫新材料名稱');
  }
  return insertNewMaterial(conn, line);
}

async function insertMaterialBatchRow(conn, { materialId, processingRecordId, sourceRecycledBatchId, quantityProduced }) {
  const batchNo = generateMaterialBatchNo();
  await conn.query(
    `INSERT INTO material_batches (
       material_id, batch_no, processing_record_id, source_recycled_batch_id,
       quantity_produced, produced_date, expiry_date, test_report_summary, attachment_file, status
     ) VALUES (?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, 'active')`,
    [materialId, batchNo, processingRecordId, sourceRecycledBatchId, quantityProduced]
  );
}

async function createFromForm(body) {
  const pool = await getPool();
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  try {
    const batchId = Number(body.recycled_batch_id);
    const quantityUsed = Number(body.quantity_used);
    if (!batchId || Number.isNaN(quantityUsed) || quantityUsed <= 0) {
      throw new Error('請選擇來源回收批次，並填寫大於 0 的本次使用回收物數量');
    }

    const [bRows] = await conn.query(
      'SELECT id, quantity FROM recycled_batches WHERE id = ? FOR UPDATE',
      [batchId]
    );
    if (!bRows.length) throw new Error('找不到回收批次');
    const batchQty = bRows[0].quantity;
    const usedBefore = await getUsedQuantityForBatch(batchId, conn);
    const remaining = (batchQty == null ? 0 : Number(batchQty)) - usedBefore;
    if (quantityUsed > remaining) {
      throw new Error(`本次使用數量不可超過剩餘可處理數量（剩餘 ${remaining}）`);
    }

    const processNo = generateProcessNo();
    const status = body.status || 'completed';

    const [insertResult] = await conn.query(
      `INSERT INTO processing_records (
         process_no, recycled_batch_id, quantity_used, process_method, process_date, result_note, status
       ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        processNo,
        batchId,
        quantityUsed,
        body.process_method || null,
        body.process_date || null,
        body.result_note || null,
        status,
      ]
    );
    const processingRecordId = insertResult.insertId;

    const lines = parseMaterialLines(body);
    for (const line of lines) {
      const materialId = await resolveMaterialId(conn, line);
      await insertMaterialBatchRow(conn, {
        materialId,
        processingRecordId,
        sourceRecycledBatchId: batchId,
        quantityProduced: line.quantity_produced,
      });
    }

    await syncRecycledBatchProcessedStatus(batchId, conn);
    await conn.commit();
    return processingRecordId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function updateFromForm(id, body) {
  const pool = await getPool();
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  try {
    const [prRows] = await conn.query(
      'SELECT * FROM processing_records WHERE id = ? FOR UPDATE',
      [id]
    );
    if (!prRows.length) throw new Error('找不到處理紀錄');
    const prev = prRows[0];
    const prevBatchId = Number(prev.recycled_batch_id);
    const batchId = Number(body.recycled_batch_id || prevBatchId);
    const quantityUsed = Number(body.quantity_used);

    if (!batchId || Number.isNaN(quantityUsed) || quantityUsed <= 0) {
      throw new Error('請選擇來源回收批次，並填寫大於 0 的本次使用回收物數量');
    }

    const [bRows] = await conn.query(
      'SELECT quantity FROM recycled_batches WHERE id = ? FOR UPDATE',
      [batchId]
    );
    if (!bRows.length) throw new Error('找不到回收批次');
    const batchQty = bRows[0].quantity;

    const [sumRows] = await conn.query(
      `SELECT COALESCE(SUM(quantity_used), 0) AS s
       FROM processing_records
       WHERE recycled_batch_id = ? AND status != 'cancelled' AND id != ?`,
      [batchId, id]
    );
    const usedOther = Number(sumRows[0].s);
    const maxAllowed = (batchQty == null ? 0 : Number(batchQty)) - usedOther;
    if (quantityUsed > maxAllowed) {
      throw new Error(`本次使用數量不可超過剩餘可處理數量（最多 ${maxAllowed}）`);
    }

    await conn.query(
      `UPDATE processing_records SET
         recycled_batch_id = ?,
         quantity_used = ?,
         process_method = ?,
         process_date = ?,
         result_note = ?,
         status = ?
       WHERE id = ?`,
      [
        batchId,
        quantityUsed,
        body.process_method || null,
        body.process_date || null,
        body.result_note || null,
        body.status || prev.status,
        id,
      ]
    );

    await conn.query('DELETE FROM material_batches WHERE processing_record_id = ?', [id]);

    const lines = parseMaterialLines(body);
    for (const line of lines) {
      const materialId = await resolveMaterialId(conn, line);
      await insertMaterialBatchRow(conn, {
        materialId,
        processingRecordId: id,
        sourceRecycledBatchId: batchId,
        quantityProduced: line.quantity_produced,
      });
    }

    await syncRecycledBatchProcessedStatus(batchId, conn);
    if (prevBatchId !== batchId) {
      await syncRecycledBatchProcessedStatus(prevBatchId, conn);
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function deleteWithCascade(id) {
  const pool = await getPool();
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  try {
    const [rows] = await conn.query(
      'SELECT recycled_batch_id FROM processing_records WHERE id = ? FOR UPDATE',
      [id]
    );
    if (!rows.length) throw new Error('找不到處理紀錄');
    const batchId = rows[0].recycled_batch_id;

    await conn.query('DELETE FROM material_batches WHERE processing_record_id = ?', [id]);
    await conn.query('DELETE FROM processing_records WHERE id = ?', [id]);

    await syncRecycledBatchProcessedStatus(batchId, conn);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function listMaterialOutputsForProcessingRecord(processingRecordId) {
  const pool = await getPool();
  const [rows] = await pool.query(
    `SELECT mb.*, m.name AS material_name, m.code AS material_code
     FROM material_batches mb
     JOIN materials m ON m.id = mb.material_id
     WHERE mb.processing_record_id = ?
     ORDER BY mb.id ASC`,
    [processingRecordId]
  );
  return rows;
}

module.exports = {
  createFromForm,
  updateFromForm,
  deleteWithCascade,
  parseMaterialLines,
  listMaterialOutputsForProcessingRecord,
};
