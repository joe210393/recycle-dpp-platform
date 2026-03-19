const { buildCrudModel } = require('./crudModelFactory');

const productBatchModel = buildCrudModel({
  table: 'product_batches',
  columns: [
    'product_id',
    'product_version_id',
    'batch_no',
    'manufacture_date',
    'expiry_date',
    'note',
    'status',
    'created_at',
    'updated_at',
  ],
});

module.exports = { productBatchModel };

