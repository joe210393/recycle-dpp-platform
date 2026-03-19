const { buildCrudModel } = require('./crudModelFactory');

const materialModel = buildCrudModel({
  table: 'materials',
  columns: [
    'name',
    'code',
    'category',
    'description',
    'is_recycled_material',
    'public_description',
    'internal_note',
    'status',
    'created_at',
    'updated_at',
  ],
});

module.exports = { materialModel };

