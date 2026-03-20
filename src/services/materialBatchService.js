const crypto = require('crypto');
const { materialBatchModel } = require('../models/materialBatchModel');

function generateMaterialBatchNo() {
  const d = new Date();
  const y = String(d.getFullYear());
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `MB-${y}${m}${day}-${rand}`;
}

const materialBatchService = {
  list: (...args) => materialBatchModel.list(...args),
  listAll: (...args) => materialBatchModel.listAll(...args),
  getById: (...args) => materialBatchModel.getById(...args),
  async create(data) {
    const payload = { ...data };
    if (!payload.batch_no || String(payload.batch_no).trim() === '') {
      payload.batch_no = generateMaterialBatchNo();
    }
    return materialBatchModel.create(payload);
  },
  async update(id, data) {
    const payload = { ...data };
    delete payload.batch_no;
    return materialBatchModel.update(id, payload);
  },
  remove: (...args) => materialBatchModel.remove(...args),
};

module.exports = { materialBatchService };
