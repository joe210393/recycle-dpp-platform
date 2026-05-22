const { buildCrudService } = require('./crudServiceFactory');
const { getPool } = require('../config/db');
const { productBatchMaterialBatchModel } = require('../models/productBatchMaterialBatchModel');

const baseService = buildCrudService(productBatchMaterialBatchModel);

function requiredId(value, label) {
  const s = String(value || '').trim();
  if (!/^[1-9]\d*$/.test(s)) {
    throw new Error(`請選擇${label}`);
  }
  return s;
}

async function validateMapping(data, currentId = null) {
  const productBatchId = requiredId(data.product_batch_id, '商品批次');
  const materialId = requiredId(data.material_id, '材料');
  const materialBatchId = requiredId(data.material_batch_id, '材料批次');
  const pool = await getPool();

  const [[productBatchRows], [materialRows], [materialBatchRows], [duplicateRows]] =
    await Promise.all([
      pool.query('SELECT id FROM product_batches WHERE id = ? LIMIT 1', [productBatchId]),
      pool.query('SELECT id FROM materials WHERE id = ? LIMIT 1', [materialId]),
      pool.query('SELECT id, material_id FROM material_batches WHERE id = ? LIMIT 1', [
        materialBatchId,
      ]),
      currentId
        ? pool.query(
            `SELECT id
             FROM product_batch_material_batches
             WHERE product_batch_id = ?
               AND material_id = ?
               AND material_batch_id = ?
               AND id <> ?
             LIMIT 1`,
            [productBatchId, materialId, materialBatchId, currentId]
          )
        : pool.query(
            `SELECT id
             FROM product_batch_material_batches
             WHERE product_batch_id = ?
               AND material_id = ?
               AND material_batch_id = ?
             LIMIT 1`,
            [productBatchId, materialId, materialBatchId]
          ),
    ]);

  if (productBatchRows.length === 0) throw new Error('選擇的商品批次不存在');
  if (materialRows.length === 0) throw new Error('選擇的材料不存在');
  if (materialBatchRows.length === 0) throw new Error('選擇的材料批次不存在');
  if (String(materialBatchRows[0].material_id) !== materialId) {
    throw new Error('選擇的材料批次不屬於所選材料');
  }
  if (duplicateRows.length > 0) {
    throw new Error('此商品批次、材料與材料批次的鏈結已存在');
  }

  return {
    ...data,
    product_batch_id: productBatchId,
    material_id: materialId,
    material_batch_id: materialBatchId,
  };
}

const productBatchMaterialBatchService = {
  list: baseService.list,
  listAll: baseService.listAll,
  getById: baseService.getById,
  getFirstForPublic: baseService.getFirstForPublic,
  async create(data) {
    const payload = await validateMapping(data);
    return productBatchMaterialBatchModel.create(payload);
  },
  async update(id, data) {
    const existing = await productBatchMaterialBatchModel.getById(id);
    if (!existing) throw new Error('找不到商品用料鏈結');
    const payload = await validateMapping({ ...existing, ...data }, id);
    return productBatchMaterialBatchModel.update(id, payload);
  },
  remove: baseService.remove,
};

module.exports = { productBatchMaterialBatchService };
