const { createAdminCrudController } = require('./crudControllerFactory');
const { productVersionService } = require('../../services/productVersionService');

const listFields = [
  { key: 'id', label: 'ID' },
  { key: 'product_id', label: '商品 ID' },
  { key: 'version_no', label: '版本號' },
  { key: 'version_name', label: '版本名稱' },
  { key: 'effective_date', label: '生效日期' },
  { key: 'status', label: '狀態' },
];

const formFields = [
  { key: 'product_id', label: '商品 ID', type: 'number', required: true },
  { key: 'version_no', label: '版本號', required: true },
  { key: 'version_name', label: '版本名稱' },
  { key: 'effective_date', label: '生效日期', type: 'date' },
  { key: 'note', label: '備註', type: 'textarea' },
  {
    key: 'status',
    label: '狀態',
    type: 'select',
    options: [
      { value: 'draft', label: '草稿' },
      { value: 'active', label: '啟用' },
      { value: 'inactive', label: '停用' },
    ],
  },
];

module.exports = createAdminCrudController({
  resourceSlug: 'product-versions',
  title: '商品版本',
  service: productVersionService,
  listFields,
  formFields,
});

