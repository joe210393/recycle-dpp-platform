const { createAdminCrudController } = require('./crudControllerFactory');
const { recyclerService } = require('../../services/recyclerService');

const listFields = [
  { key: 'id', label: '編號' },
  { key: 'name', label: '廠商名稱' },
  { key: 'code', label: '廠商代碼' },
  { key: 'tax_id', label: '統編' },
  { key: 'status', label: '狀態' },
  { key: 'created_at', label: '建立時間' },
];

const baseFormFields = [
  { key: 'name', label: '廠商名稱', required: true },
  { key: 'tax_id', label: '統編' },
  { key: 'contact_person', label: '聯絡人' },
  { key: 'phone', label: '電話' },
  { key: 'email', label: '電子郵件' },
  { key: 'address', label: '地址' },
  { key: 'website', label: '官網' },
  { key: 'certificate_no', label: '回收證號' },
  { key: 'certificate_file', label: '回收證明附件' },
  { key: 'public_note', label: '對外公開備註', type: 'textarea' },
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
  const codeField = record && record.code
    ? [{ key: 'code', label: '廠商代碼（系統產生）', readonly: true, helpText: '建立時由系統自動給予，建立後不可修改。' }]
    : [];
  return [...codeField, ...baseFormFields];
}

module.exports = createAdminCrudController({
  resourceSlug: 'recyclers',
  title: '回收廠商',
  service: recyclerService,
  listFields,
  formFields,
});

