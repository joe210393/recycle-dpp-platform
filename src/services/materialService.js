const crypto = require('crypto');
const { materialModel } = require('../models/materialModel');

function generateMaterialCode() {
  const d = new Date();
  const y = String(d.getFullYear());
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `MAT-${y}${m}${day}-${rand}`;
}

const materialService = {
  list: (...args) => materialModel.list(...args),
  listAll: (...args) => materialModel.listAll(...args),
  getById: (...args) => materialModel.getById(...args),
  async create(data) {
    const payload = { ...data };
    if (!payload.code || String(payload.code).trim() === '') {
      payload.code = generateMaterialCode();
    }
    return materialModel.create(payload);
  },
  async update(id, data) {
    const payload = { ...data };
    delete payload.code;
    return materialModel.update(id, payload);
  },
  remove: (...args) => materialModel.remove(...args),
};

module.exports = { materialService };
