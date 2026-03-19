const { buildCrudModel } = require('./crudModelFactory');

const productVersionModel = buildCrudModel({
  table: 'product_versions',
  columns: [
    'product_id',
    'version_no',
    'version_name',
    'effective_date',
    'note',
    'status',
    'created_at',
    'updated_at',
  ],
});

module.exports = { productVersionModel };

