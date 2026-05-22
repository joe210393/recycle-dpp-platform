const { createAdminCrudController } = require('./crudControllerFactory');
const { productBatchService } = require('../../services/productBatchService');
const {
  decorateRowsWithReferences,
  getReferenceOptions,
} = require('../../utils/adminRelationLabels');

const listFields = [
  { key: 'id', label: 'ID' },
  { key: 'product_label', label: '商品' },
  { key: 'product_version_label', label: '商品版本' },
  { key: 'batch_no', label: '商品批次號' },
  { key: 'manufacture_date', label: '製造日期' },
  { key: 'expiry_date', label: '有效日期' },
  { key: 'status', label: '狀態' },
];

async function formFields() {
  const [productOptions, productVersionOptions] = await Promise.all([
    getReferenceOptions('product', '請選擇商品', '請先建立商品'),
    getReferenceOptions('productVersion', '請選擇商品版本', '請先建立商品版本'),
  ]);

  return [
    { key: 'product_id', label: '商品', type: 'select', options: productOptions, required: true },
    {
      key: 'product_version_id',
      label: '商品版本',
      type: 'select',
      options: productVersionOptions,
      required: true,
    },
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
}

module.exports = createAdminCrudController({
  resourceSlug: 'product-batches',
  title: '商品批次',
  service: productBatchService,
  listFields,
  formFields,
  decorateRows: (rows) =>
    decorateRowsWithReferences(rows, [
      { sourceKey: 'product_id', targetKey: 'product_label', type: 'product' },
      {
        sourceKey: 'product_version_id',
        targetKey: 'product_version_label',
        type: 'productVersion',
      },
    ]),
});
