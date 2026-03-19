const { createAdminCrudController } = require('./crudControllerFactory');
const { dppExportService } = require('../../services/dppExportService');

const listFields = [
  { key: 'id', label: 'ID' },
  { key: 'product_passport_id', label: '商品護照 ID' },
  { key: 'export_type', label: '匯出類型' },
  { key: 'format', label: '格式' },
  { key: 'file_path', label: '檔案路徑' },
  { key: 'exported_at', label: '匯出時間' },
];

const formFields = [
  { key: 'product_passport_id', label: '商品護照 ID', type: 'number', required: true },
  {
    key: 'export_type',
    label: '匯出類型',
    type: 'select',
    options: [
      { value: 'consumer', label: '消費者' },
      { value: 'b2b', label: '通路/夥伴' },
      { value: 'audit', label: '稽核' },
    ],
  },
  {
    key: 'format',
    label: '格式',
    type: 'select',
    options: [
      { value: 'json', label: 'JSON' },
      { value: 'csv', label: 'CSV' },
      { value: 'excel', label: 'Excel' },
      { value: 'pdf', label: 'PDF' },
    ],
  },
  { key: 'file_path', label: '檔案路徑', required: true },
  { key: 'exported_at', label: '匯出時間' },
  { key: 'exported_by', label: '匯出者' },
];

module.exports = createAdminCrudController({
  resourceSlug: 'dpp-exports',
  title: 'DPP 匯出紀錄',
  service: dppExportService,
  listFields,
  formFields,
});

