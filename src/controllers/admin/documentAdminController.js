const { createAdminCrudController } = require('./crudControllerFactory');
const { documentService } = require('../../services/documentService');
const {
  decorateDocumentTargetRows,
  documentTargetTypes,
  getDocumentTargetSelectFields,
} = require('../../utils/adminRelationLabels');

const listFields = [
  { key: 'id', label: 'ID' },
  { key: 'target_type_label', label: '綁定類型' },
  { key: 'target_label', label: '綁定對象' },
  { key: 'document_type', label: '文件類型' },
  { key: 'title', label: '標題' },
  { key: 'visibility_level', label: '可見層級' },
  { key: 'created_at', label: '建立時間' },
];

async function formFields(req, record) {
  return [
    {
      key: 'target_type',
      label: '綁定類型',
      type: 'select',
      options: [{ value: '', label: '不綁定（可稍後在商品護照編輯頁勾選綁定）' }, ...documentTargetTypes],
    },
    ...(await getDocumentTargetSelectFields(record)),
    { key: 'document_type', label: '文件類型', required: true },
    { key: 'title', label: '標題', required: true },
    {
      key: 'file_path',
      label: '檔案（PDF / 圖片）',
      type: 'file',
      required: true,
      helpText: '請選擇檔案上傳，或貼上已存在的檔案路徑。前台「下載 / 查看」會連到這個路徑。',
    },
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
}

function preprocess(data) {
  const out = { ...data };
  const selectedKey = out.target_type ? `target_id_${out.target_type}` : '';
  if (selectedKey && out[selectedKey]) {
    out.target_id = out[selectedKey];
  }
  for (const item of documentTargetTypes) {
    delete out[`target_id_${item.value}`];
  }
  // 允許不綁定：target 設為 NULL，之後可在商品護照編輯頁勾選綁定。
  if (!out.target_type) {
    out.target_type = null;
    out.target_id = null;
    return out;
  }
  if (!out.target_id) {
    throw new Error('請選擇綁定對象');
  }
  return out;
}

module.exports = createAdminCrudController({
  resourceSlug: 'documents',
  title: '文件附件',
  service: documentService,
  listFields,
  formFields,
  preprocess,
  decorateRows: decorateDocumentTargetRows,
});
