const { createAdminCrudController } = require('./crudControllerFactory');
const { documentService } = require('../../services/documentService');

const listFields = [
  { key: 'id', label: 'ID' },
  { key: 'target_type', label: '綁定類型' },
  { key: 'target_id', label: '綁定對象 ID' },
  { key: 'document_type', label: '文件類型' },
  { key: 'title', label: '標題' },
  { key: 'visibility_level', label: '可見層級' },
  { key: 'created_at', label: '建立時間' },
];

const formFields = [
  {
    key: 'target_type',
    label: '綁定類型',
    type: 'select',
    options: [
      { value: 'recycler', label: '回收廠商' },
      { value: 'recycled_batch', label: '回收批次' },
      { value: 'processing_record', label: '處理紀錄' },
      { value: 'material', label: '材料' },
      { value: 'material_batch', label: '材料批次' },
      { value: 'product', label: '商品' },
      { value: 'product_batch', label: '商品批次' },
      { value: 'product_passport', label: '商品護照' },
    ],
  },
  { key: 'target_id', label: '綁定對象 ID', type: 'number', required: true },
  { key: 'document_type', label: '文件類型', required: true },
  { key: 'title', label: '標題', required: true },
  { key: 'file_path', label: '檔案路徑', required: true },
  { key: 'summary', label: '摘要', type: 'textarea' },
  {
    key: 'visibility_level',
    label: '可見層級',
    type: 'select',
    options: [
      { value: 'consumer', label: '消費者' },
      { value: 'b2b', label: '通路/夥伴' },
      { value: 'audit', label: '稽核' },
      { value: 'internal', label: '內部' },
    ],
  },
];

module.exports = createAdminCrudController({
  resourceSlug: 'documents',
  title: '文件附件',
  service: documentService,
  listFields,
  formFields,
});

