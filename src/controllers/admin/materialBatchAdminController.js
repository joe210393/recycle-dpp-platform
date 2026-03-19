const { createAdminCrudController } = require('./crudControllerFactory');
const { materialBatchService } = require('../../services/materialBatchService');

const listFields = [
  { key: 'id', label: 'ID' },
  { key: 'batch_no', label: '材料批次號' },
  { key: 'material_id', label: '材料 ID' },
  { key: 'processing_record_id', label: '處理紀錄 ID' },
  { key: 'source_recycled_batch_id', label: '來源回收批次 ID' },
  { key: 'produced_date', label: '製成日期' },
  { key: 'expiry_date', label: '有效日期' },
  { key: 'status', label: '狀態' },
];

async function getFormFields(req, record) {
  const { materialService } = require('../../services/materialService');
  const { processingRecordService } = require('../../services/processingRecordService');
  const { recycledBatchService } = require('../../services/recycledBatchService');

  const [materials, processingRecords, recycledBatches] = await Promise.all([
    materialService.listAll(),
    processingRecordService.listAll(),
    recycledBatchService.listAll(),
  ]);

  const materialOptions = materials.map((m) => ({
    value: String(m.id),
    label: `${m.name}（ID:${m.id}）`,
  }));
  if (materialOptions.length === 0) {
    materialOptions.push({ value: '', label: '請先建立材料主檔' });
  }
  const processingRecordOptions = processingRecords.map((r) => ({
    value: String(r.id),
    label: `${r.process_no}（ID:${r.id}）`,
  }));
  if (processingRecordOptions.length === 0) {
    processingRecordOptions.push({ value: '', label: '請先建立處理紀錄' });
  }
  const recycledBatchOptions = recycledBatches.map((b) => ({
    value: String(b.id),
    label: `${b.batch_no}（ID:${b.id}）`,
  }));
  if (recycledBatchOptions.length === 0) {
    recycledBatchOptions.push({ value: '', label: '請先建立來源回收批次' });
  }

  return [
    {
      key: 'material_id',
      label: '材料',
      type: 'select',
      options: materialOptions,
      required: true,
    },
    { key: 'batch_no', label: '材料批次號', required: true },
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
});

