const { buildCrudModel } = require('./crudModelFactory');

const productPassportModel = buildCrudModel({
  table: 'product_passports',
  columns: [
    'product_id',
    'product_version_id',
    'product_batch_id',
    'passport_code',
    'public_url',
    'qr_code_path',
    'status',
    'created_at',
    'updated_at',
  ],
});

module.exports = { productPassportModel };

