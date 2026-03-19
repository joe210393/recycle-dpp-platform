const { createAdminCrudController } = require('./crudControllerFactory');
const { processingRecordService } = require('../../services/processingRecordService');

const listFields = [
  { key: 'id', label: '編號' },
  { key: 'process_no', label: '處理單號' },
  { key: 'recycled_batch_id', label: '來源回收批次 ID' },
  { key: 'process_method', label: '處理方式' },
  { key: 'process_date', label: '處理日期' },
  { key: 'status', label: '狀態' },
];

async function getFormFields(req, record) {
  const { recycledBatchService } = require('../../services/recycledBatchService');
  const recycledBatches = await recycledBatchService.listAll();

  const recycledBatchOptions = recycledBatches.map((b) => ({
    value: String(b.id),
    label: `${b.batch_no}（ID:${b.id}）`,
  }));
  if (recycledBatchOptions.length === 0) {
    recycledBatchOptions.push({ value: '', label: '請先建立回收批次' });
  }

  const processNoField =
    record && record.process_no
      ? [
          {
            key: 'process_no',
            label: '處理單號（系統產生）',
            readonly: true,
            helpText: '建立時由系統自動給予，建立後不可修改。',
          },
        ]
      : [];

  return [
    ...processNoField,
    {
      key: 'recycled_batch_id',
      label: '來源回收批次',
      type: 'select',
      options: recycledBatchOptions,
      required: true,
    },
    { key: 'process_method', label: '處理方式' },
    {
      key: 'process_date',
      label: '處理日期時間',
      type: 'datetime-local',
      helpText: '時間以台灣時間（GMT+8）顯示與儲存。',
    },
    { key: 'result_note', label: '處理結果備註', type: 'textarea' },
    {
      key: 'status',
      label: '狀態',
      type: 'select',
      options: [
        { value: 'draft', label: '草稿' },
        { value: 'completed', label: '已完成' },
        { value: 'cancelled', label: '已取消' },
      ],
    },
  ];
}

module.exports = createAdminCrudController({
  resourceSlug: 'processing-records',
  title: '處理紀錄',
  service: processingRecordService,
  listFields,
  formFields: getFormFields,
});

