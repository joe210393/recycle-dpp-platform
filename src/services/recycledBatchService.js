const { recycledBatchModel } = require('../models/recycledBatchModel');

const crypto = require('crypto');

function generateBatchNo() {
  const d = new Date();
  const y = String(d.getFullYear());
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `RB-${y}${m}${day}-${rand}`;
}

const recycledBatchService = {
  list: (...args) => recycledBatchModel.list(...args),
  listAll: (...args) => recycledBatchModel.listAll(...args),
  getById: (...args) => recycledBatchModel.getById(...args),
  async create(data) {
    const payload = { ...data };
    if (!payload.batch_no) payload.batch_no = generateBatchNo();
    return recycledBatchModel.create(payload);
  },
  async update(id, data) {
    const payload = { ...data };
    // Prevent changing batch_no after creation.
    delete payload.batch_no;
    return recycledBatchModel.update(id, payload);
  },
  remove: (...args) => recycledBatchModel.remove(...args),
};

module.exports = { recycledBatchService };

