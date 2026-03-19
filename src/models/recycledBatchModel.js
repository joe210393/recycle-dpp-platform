const { buildCrudModel } = require('./crudModelFactory');

const recycledBatchModel = buildCrudModel({
  table: 'recycled_batches',
  columns: [
    'recycled_item_id',
    'recycler_id',
    'batch_no',
    'received_date',
    'quantity',
    'unit',
    'source_location',
    'trace_code',
    'trace_url',
    'certificate_no',
    'test_report_summary',
    'attachment_file',
    'processed_status',
    'public_visible',
    'created_at',
    'updated_at',
  ],
});

module.exports = { recycledBatchModel };

