const { buildCrudModel } = require('./crudModelFactory');

const documentModel = buildCrudModel({
  table: 'documents',
  columns: [
    'target_type',
    'target_id',
    'document_type',
    'title',
    'file_path',
    'summary',
    'visibility_level',
    'created_at',
    'updated_at',
  ],
});

module.exports = { documentModel };

