const { buildCrudModel } = require('./crudModelFactory');

const productModel = buildCrudModel({
  table: 'products',
  columns: [
    'name',
    'sku',
    'category',
    'short_description',
    'usage_instruction',
    'caution',
    'specification',
    'main_image',
    'is_public',
    'passport_enabled',
    'slug',
    'status',
    'created_at',
    'updated_at',
  ],
});

module.exports = { productModel };

