const crypto = require('crypto');
const { recycledItemModel } = require('../models/recycledItemModel');

function generateCode() {
  const d = new Date();
  const y = String(d.getFullYear());
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
  return `RI-${y}${m}${day}-${rand}`;
}

const recycledItemService = {
  list: (...args) => recycledItemModel.list(...args),
  listAll: (...args) => recycledItemModel.listAll(...args),
  getById: (...args) => recycledItemModel.getById(...args),
  async create(data) {
    const payload = { ...data };
    if (!payload.code) payload.code = generateCode();
    return recycledItemModel.create(payload);
  },
  update: (...args) => recycledItemModel.update(...args),
  remove: (...args) => recycledItemModel.remove(...args),
};

module.exports = { recycledItemService };

