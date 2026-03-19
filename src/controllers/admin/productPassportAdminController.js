const { createAdminCrudController } = require('./crudControllerFactory');
const { productPassportService } = require('../../services/productPassportService');

const listFields = [
  { key: 'id', label: 'ID' },
  { key: 'passport_code', label: '護照代碼' },
  { key: 'product_id', label: '商品 ID' },
  { key: 'product_version_id', label: '商品版本 ID' },
  { key: 'product_batch_id', label: '商品批次 ID' },
  { key: 'status', label: '狀態' },
  { key: 'public_url', label: '公開網址' },
];

const formFields = [
  { key: 'product_id', label: '商品 ID', type: 'number', required: true },
  { key: 'product_version_id', label: '商品版本 ID', type: 'number', required: true },
  { key: 'product_batch_id', label: '商品批次 ID', type: 'number', required: true },
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

module.exports = createAdminCrudController({
  resourceSlug: 'product-passports',
  title: '商品護照',
  service: productPassportService,
  listFields,
  formFields,
});

