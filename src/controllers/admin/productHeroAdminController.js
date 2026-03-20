const { createAdminCrudController } = require('./crudControllerFactory');
const { productHeroService } = require('../../services/productHeroService');
const { preprocessEnsureNonEmpty } = require('../../utils/preprocessEnsureNonEmpty');
const { omitEmptyImagePathsOnPut } = require('../../utils/omitEmptyImagePathsOnPut');

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
  { key: 'hero_image_path', label: '商品圖（上傳檔或填網址/路徑）', type: 'image' },
];

function preprocess(body, req) {
  const b = preprocessEnsureNonEmpty(body, [{ key: 'title', label: '主標題' }]);
  omitEmptyImagePathsOnPut(b, req, ['hero_image_path']);
  return b;
}

module.exports = createAdminCrudController({
  resourceSlug: 'product-hero',
  title: '商品頁 Hero 區塊',
  service: productHeroService,
  listFields,
  formFields,
  preprocess,
});

