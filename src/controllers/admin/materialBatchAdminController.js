const { createAdminCrudController } = require('./crudControllerFactory');
const { materialBatchService } = require('../../services/materialBatchService');
const {
  decorateRowsWithReferences,
  getReferenceOptions,
} = require('../../utils/adminRelationLabels');

const listFields = [
  { key: 'id', label: 'ID' },
  { key: 'batch_no', label: '材料批次號' },
  { key: 'material_label', label: '材料' },
  { key: 'processing_record_label', label: '處理紀錄' },
  { key: 'source_recycled_batch_label', label: '來源回收批次' },
  { key: 'produced_date', label: '製成日期' },
  { key: 'expiry_date', label: '有效日期' },
  { key: 'status', label: '狀態' },
];

async function getFormFields(req, record) {
  const [materialOptions, processingRecordOptions, recycledBatchOptions] = await Promise.all([
    getReferenceOptions('material', '請選擇材料', '請先建立材料主檔'),
    getReferenceOptions('processingRecord', '請選擇處理紀錄', '請先建立處理紀錄'),
    getReferenceOptions('recycledBatch', '請選擇來源回收批次', '請先建立來源回收批次'),
  ]);

  return [
    {
      key: 'material_id',
      label: '材料',
      type: 'select',
      options: materialOptions,
      required: true,
    },
    ...(record && record.batch_no
      ? [{ key: 'batch_no', label: '材料批次號（系統產生）', readonly: true }]
      : []),
    {
      key: 'processing_record_id',
      label: '處理紀錄',
      type: 'select',
      options: processingRecordOptions,
      required: true,
    },
    {
      key: 'source_recycled_batch_id',
      label: '來源回收批次',
      type: 'select',
      options: recycledBatchOptions,
      required: true,
    },
    { key: 'produced_date', label: '製成日期', type: 'date' },
    { key: 'expiry_date', label: '有效日期', type: 'date' },
    { key: 'test_report_summary', label: '檢測報告摘要', type: 'textarea' },
    { key: 'attachment_file', label: '附件檔案' },
    {
      key: 'status',
      label: '狀態',
      type: 'select',
      options: [
        { value: 'active', label: '啟用' },
        { value: 'inactive', label: '停用' },
        { value: 'used_up', label: '已用完' },
      ],
    },
  ];
}

module.exports = createAdminCrudController({
  resourceSlug: 'material-batches',
  title: '材料批次',
  service: materialBatchService,
  listFields,
  formFields: getFormFields,
  decorateRows: (rows) =>
    decorateRowsWithReferences(rows, [
      { sourceKey: 'material_id', targetKey: 'material_label', type: 'material' },
      {
        sourceKey: 'processing_record_id',
        targetKey: 'processing_record_label',
        type: 'processingRecord',
      },
      {
        sourceKey: 'source_recycled_batch_id',
        targetKey: 'source_recycled_batch_label',
        type: 'recycledBatch',
      },
    ]),
});
