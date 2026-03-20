const { recycledBatchModel } = require('../models/recycledBatchModel');
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
  remove: (...args) => recycledBatchModel.remove(...args),
};

module.exports = { recycledBatchService };
