const { createAdminCrudController } = require('./crudControllerFactory');
const { materialService } = require('../../services/materialService');

const listFields = [
  { key: 'id', label: '編號' },
  { key: 'name', label: '材料名稱' },
  { key: 'code', label: '材料代碼' },
  { key: 'category', label: '材料分類' },
  { key: 'is_recycled_material', label: '是否回收再生成' },
  { key: 'status', label: '狀態' },
];

const baseFields = [
  { key: 'name', label: '材料名稱', required: true },
  { key: 'category', label: '材料分類' },
  { key: 'description', label: '材料說明', type: 'textarea' },
  { key: 'is_recycled_material', label: '是否回收再生成材料', type: 'checkbox' },
  { key: 'public_description', label: '對外簡述', type: 'textarea' },
  { key: 'internal_note', label: '內部備註', type: 'textarea' },
  {
    key: 'status',
    label: '狀態',
    type: 'select',
    options: [
      { value: 'active', label: '啟用' },
      { value: 'inactive', label: '停用' },
    ],
  },
];

async function formFields(req, record) {
  const codeField =
    record && record.code
      ? [
          {
            key: 'code',
            label: '材料代碼（系統產生）',
            readonly: true,
            helpText: '建立時由系統自動給予，建立後不可修改。',
          },
        ]
      : [];
  return [...codeField, ...baseFields];
}

module.exports = createAdminCrudController({
  resourceSlug: 'materials',
  title: '材料主檔',
  service: materialService,
  listFields,
  formFields,
});
