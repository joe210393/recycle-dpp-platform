const { buildCrudModel } = require('./crudModelFactory');

const productBomItemModel = buildCrudModel({
  table: 'product_bom_items',
  columns: [
    'product_version_id',
    'material_id',
    'material_role',
    'sort_order',
    'public_visible',
    'note',
    'created_at',
    'updated_at',
  ],
});

module.exports = { productBomItemModel };

