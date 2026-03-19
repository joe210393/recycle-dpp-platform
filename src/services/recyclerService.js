const crypto = require('crypto');
const { recyclerModel } = require('../models/recyclerModel');

/** 廠商代碼：RC-YYYYMMDD-隨機6碼（與 RI-/RB- 風格一致） */
function generateRecyclerCode() {
  const d = new Date();
  const y = String(d.getFullYear());
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `RC-${y}${m}${day}-${rand}`;
}

const recyclerService = {
  list: (...args) => recyclerModel.list(...args),
  listAll: (...args) => recyclerModel.listAll(...args),
  getById: (...args) => recyclerModel.getById(...args),
  async create(data) {
    const payload = { ...data };
    if (!payload.code || String(payload.code).trim() === '') {
      payload.code = generateRecyclerCode();
    }
    return recyclerModel.create(payload);
  },
  async update(id, data) {
    const payload = { ...data };
    // 建立後不可改代碼，避免外鍵/追溯引用錯亂
    delete payload.code;
    return recyclerModel.update(id, payload);
  },
  remove: (...args) => recyclerModel.remove(...args),
};

module.exports = { recyclerService };
