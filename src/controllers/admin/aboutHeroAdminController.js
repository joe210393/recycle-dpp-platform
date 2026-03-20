const { createAdminCrudController } = require('./crudControllerFactory');
const { aboutHeroService } = require('../../services/aboutHeroService');
const { preprocessEnsureNonEmpty } = require('../../utils/preprocessEnsureNonEmpty');

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
  { key: 'hero_image_path', label: 'Hero 圖片（上傳檔或填網址/路徑）', type: 'image' },
];

function preprocess(body) {
  return preprocessEnsureNonEmpty(body, [{ key: 'title', label: '主標題' }]);
}

module.exports = createAdminCrudController({
  resourceSlug: 'about-hero',
  title: '關於我們 Hero 區塊',
  service: aboutHeroService,
  listFields,
  formFields,
  preprocess,
});

