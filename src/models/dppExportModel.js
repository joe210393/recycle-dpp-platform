const { buildCrudModel } = require('./crudModelFactory');

const dppExportModel = buildCrudModel({
  table: 'dpp_exports',
  columns: [
    'product_passport_id',
    'export_type',
    'format',
    'file_path',
    'exported_at',
    'exported_by',
  ],
});

module.exports = { dppExportModel };

