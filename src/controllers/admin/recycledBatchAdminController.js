const { createAdminCrudController } = require('./crudControllerFactory');
const { recycledBatchService } = require('../../services/recycledBatchService');

const listFields = [
  { key: 'id', label: 'ID' },
  { key: 'batch_no', label: '回收批次號' },
  { key: 'recycled_item_id', label: '回收物 ID' },
  { key: 'recycler_id', label: '回收廠商 ID' },
  { key: 'received_date', label: '收料日期' },
  { key: 'quantity', label: '數量' },
  { key: 'processed_status', label: '處理狀態' },
  { key: 'public_visible', label: '是否公開' },
];

async function getFormFields(req, record) {
  const { recyclerService } = require('../../services/recyclerService');
  const { recycledItemService } = require('../../services/recycledItemService');

  const [recyclers, recycledItems] = await Promise.all([
    recyclerService.listAll(),
    recycledItemService.listAll(),
  ]);

  const recyclerOptions = recyclers.map((r) => ({
    value: String(r.id),
    label: `${r.name}（ID:${r.id}）`,
  }));
  if (recyclerOptions.length === 0) recyclerOptions.push({ value: '', label: '請先建立回收廠商' });

  const recycledItemOptions = recycledItems.map((i) => ({
    value: String(i.id),
    label: `${i.name}（${i.code} / ID:${i.id}）`,
  }));
  if (recycledItems.length === 0) recycledItemOptions.push({ value: '', label: '（目前沒有回收物類型）' });

  return [
    {
      key: 'recycler_id',
      label: '回收廠商',
      type: 'select',
      options: recyclerOptions,
      required: true,
      helpText: '若沒有資料，請先建立回收廠商。',
      helpLink: { href: '/admin/recyclers/new', label: '新增回收廠商' },
      showAddButton: false,
    },
    {
      key: 'recycled_item_id',
      label: '回收物類型',
      type: 'select',
      options: recycledItemOptions,
      required: true,
      helpText: '若沒有資料，請先建立回收物類型。',
      helpLink: { href: '/admin/recycled-items/new', label: '新增回收物類型' },
      showAddButton: false,
    },

    ...(record && record.batch_no
      ? [{ key: 'batch_no', label: '回收批次號（系統產生）', readonly: true }]
      : []),
    { key: 'received_date', label: '收料日期', type: 'date' },
    { key: 'quantity', label: '數量', type: 'number' },
    { key: 'unit', label: '單位' },
    { key: 'source_location', label: '來源地' },
    { key: 'trace_code', label: '追溯編號' },
    { key: 'trace_url', label: '追溯網站' },
    { key: 'certificate_no', label: '回收證號' },
    { key: 'test_report_summary', label: '檢測報告摘要', type: 'textarea' },
    { key: 'attachment_file', label: '附件檔案' },
    {
      key: 'processed_status',
      label: '處理狀態',
      type: 'select',
      options: [
        { value: 'pending', label: '待處理' },
        { value: 'partial', label: '部分處理' },
        { value: 'processed', label: '已處理' },
      ],
    },
    { key: 'public_visible', label: '是否公開', type: 'checkbox' },
  ];
}

module.exports = createAdminCrudController({
  resourceSlug: 'recycled-batches',
  title: '回收批次',
  service: recycledBatchService,
  listFields,
  formFields: getFormFields,
});

