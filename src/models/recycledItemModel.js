const { buildCrudModel } = require('./crudModelFactory');

const recycledItemModel = buildCrudModel({
  table: 'recycled_items',
  columns: ['name', 'code', 'category', 'description', 'status', 'created_at', 'updated_at'],
});

module.exports = { recycledItemModel };

