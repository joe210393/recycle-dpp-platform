const { buildCrudModel } = require('./crudModelFactory');

const materialBatchModel = buildCrudModel({
  table: 'material_batches',
  columns: [
    'material_id',
    'batch_no',
    'processing_record_id',
    'source_recycled_batch_id',
    'quantity_produced',
    'produced_date',
    'expiry_date',
    'test_report_summary',
    'attachment_file',
    'status',
    'created_at',
    'updated_at',
  ],
});

module.exports = { materialBatchModel };

