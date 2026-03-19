const { buildCrudModel } = require('./crudModelFactory');

const productBatchMaterialBatchModel = buildCrudModel({
  table: 'product_batch_material_batches',
  columns: ['product_batch_id', 'material_id', 'material_batch_id', 'note', 'created_at', 'updated_at'],
});

module.exports = { productBatchMaterialBatchModel };

