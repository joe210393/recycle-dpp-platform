const { createAdminCrudController } = require('./crudControllerFactory');
const { productHeroService } = require('../../services/productHeroService');

const listFields = [
  { key: 'id', label: '編號' },
  { key: 'eyebrow', label: '上方小標' },
  { key: 'title', label: '主標題' },
  { key: 'created_at', label: '建立時間' },
];

const formFields = [
  { key: 'eyebrow', label: '上方小標' },
  { key: 'title', label: '主標題（可包含 <br> ）', required: true, type: 'textarea' },
  { key: 'description', label: '說明文字', type: 'textarea' },
  { key: 'hero_image_path', label: 'Hero 圖片路徑（可空白）' },
];

module.exports = createAdminCrudController({
  resourceSlug: 'product-hero',
  title: '商品頁 Hero 區塊',
  service: productHeroService,
  listFields,
  formFields,
});

