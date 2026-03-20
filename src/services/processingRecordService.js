const crypto = require('crypto');
const { processingRecordModel } = require('../models/processingRecordModel');

/** 處理單號：PR-YYYYMMDD-隨機6碼 */
function generateProcessNo() {
  const d = new Date();
  const y = String(d.getFullYear());
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `PR-${y}${m}${day}-${rand}`;
}

const processingRecordService = {
  list: (...args) => processingRecordModel.list(...args),
  listAll: (...args) => processingRecordModel.listAll(...args),
  getById: (...args) => processingRecordModel.getById(...args),
  async create(data) {
    const payload = { ...data };
    if (!payload.process_no || String(payload.process_no).trim() === '') {
      payload.process_no = generateProcessNo();
    }
    if (payload.quantity_used == null || payload.quantity_used === '') {
      payload.quantity_used = 0;
    }
    return processingRecordModel.create(payload);
  },
  async update(id, data) {
    const payload = { ...data };
    delete payload.process_no;
    return processingRecordModel.update(id, payload);
  },
  remove: (...args) => processingRecordModel.remove(...args),
};

module.exports = { processingRecordService };
