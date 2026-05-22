const { createAdminCrudController } = require('./crudControllerFactory');
const { productPassportService } = require('../../services/productPassportService');
const {
  decorateRowsWithReferences,
  getReferenceOptions,
} = require('../../utils/adminRelationLabels');

const listFields = [
  { key: 'id', label: 'ID' },
  { key: 'passport_code', label: '護照代碼' },
  { key: 'product_label', label: '商品' },
  { key: 'product_version_label', label: '商品版本' },
  { key: 'product_batch_label', label: '商品批次' },
  { key: 'status', label: '狀態' },
  { key: 'public_url', label: '公開網址' },
];

async function formFields() {
  const [productOptions, productVersionOptions, productBatchOptions] = await Promise.all([
    getReferenceOptions('product', '請選擇商品', '請先建立商品'),
    getReferenceOptions('productVersion', '請選擇商品版本', '請先建立商品版本'),
    getReferenceOptions('productBatch', '請選擇商品批次', '請先建立商品批次'),
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
    {
      key: 'product_batch_id',
      label: '商品批次',
      type: 'select',
      options: productBatchOptions,
      required: true,
    },
    { key: 'passport_code', label: '護照代碼', required: true },
    { key: 'public_url', label: '公開網址' },
    { key: 'qr_code_path', label: 'QR Code 圖片路徑' },
    {
      key: 'status',
      label: '狀態',
      type: 'select',
      options: [
        { value: 'draft', label: '草稿' },
        { value: 'published', label: '已發布' },
        { value: 'archived', label: '已歸檔' },
      ],
    },
  ];
}

module.exports = createAdminCrudController({
  resourceSlug: 'product-passports',
  title: '商品護照',
  service: productPassportService,
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
      { sourceKey: 'product_batch_id', targetKey: 'product_batch_label', type: 'productBatch' },
    ]),
});
