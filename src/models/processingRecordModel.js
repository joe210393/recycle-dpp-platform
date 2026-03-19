const { buildCrudModel } = require('./crudModelFactory');

const processingRecordModel = buildCrudModel({
  table: 'processing_records',
  columns: [
    'process_no',
    'recycled_batch_id',
    'process_method',
    'process_date',
    'result_note',
    'status',
    'created_at',
    'updated_at',
  ],
});

module.exports = { processingRecordModel };

