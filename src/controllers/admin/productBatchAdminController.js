const { createAdminCrudController } = require('./crudControllerFactory');
const { productBatchService } = require('../../services/productBatchService');

const listFields = [
  { key: 'id', label: 'ID' },
  { key: 'product_id', label: '商品 ID' },
  { key: 'product_version_id', label: '商品版本 ID' },
  { key: 'batch_no', label: '商品批次號' },
  { key: 'manufacture_date', label: '製造日期' },
  { key: 'expiry_date', label: '有效日期' },
  { key: 'status', label: '狀態' },
];

const formFields = [
  { key: 'product_id', label: '商品 ID', type: 'number', required: true },
  { key: 'product_version_id', label: '商品版本 ID', type: 'number', required: true },
  { key: 'batch_no', label: '商品批次號', required: true },
  { key: 'manufacture_date', label: '製造日期', type: 'date' },
  { key: 'expiry_date', label: '有效日期', type: 'date' },
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
  resourceSlug: 'product-batches',
  title: '商品批次',
  service: productBatchService,
  listFields,
  formFields,
});

