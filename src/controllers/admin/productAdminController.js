const { createAdminCrudController } = require('./crudControllerFactory');
const { productService } = require('../../services/productService');

const listFields = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: '商品名稱' },
  { key: 'sku', label: 'SKU' },
  { key: 'category', label: '分類' },
  { key: 'is_public', label: '是否公開' },
  { key: 'passport_enabled', label: '是否啟用護照' },
  { key: 'status', label: '狀態' },
];

const formFields = [
  { key: 'name', label: '商品名稱', required: true },
  { key: 'sku', label: 'SKU', required: true },
  { key: 'category', label: '分類' },
  { key: 'short_description', label: '商品簡述', type: 'textarea' },
  { key: 'usage_instruction', label: '使用方式', type: 'textarea' },
  { key: 'caution', label: '注意事項', type: 'textarea' },
  { key: 'specification', label: '規格' },
  { key: 'main_image', label: '主圖（URL/路徑）' },
  { key: 'is_public', label: '是否公開', type: 'checkbox' },
  { key: 'passport_enabled', label: '是否啟用護照', type: 'checkbox' },
  { key: 'slug', label: '前台網址 slug', required: true },
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
  resourceSlug: 'products',
  title: '商品主檔',
  service: productService,
  listFields,
  formFields,
});

