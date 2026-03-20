const { createAdminCrudController } = require('./crudControllerFactory');
const { homeHeroService } = require('../../services/homeHeroService');
const { preprocessEnsureNonEmpty } = require('../../utils/preprocessEnsureNonEmpty');

const listFields = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: '主標題' },
  { key: 'eyebrow', label: '上方小標' },
  { key: 'primary_button_text', label: '主按鈕文字' },
];

const formFields = [
  { key: 'eyebrow', label: '上方小標（例如：銀髮友善 × 環境友善）' },
  { key: 'title', label: '主標題', required: true },
  { key: 'description', label: '說明文字', type: 'textarea' },
  { key: 'primary_button_text', label: '主按鈕文字' },
  { key: 'primary_button_url', label: '主按鈕連結 URL' },
  { key: 'secondary_button_text', label: '次按鈕文字' },
  { key: 'secondary_button_url', label: '次按鈕連結 URL' },
  { key: 'hero_image_path', label: '主視覺圖片（上傳檔或填網址/路徑）', type: 'image' },
  { key: 'info1_title', label: '重點一標題' },
  { key: 'info1_body', label: '重點一說明', type: 'textarea' },
  { key: 'info2_title', label: '重點二標題' },
  { key: 'info2_body', label: '重點二說明', type: 'textarea' },
  { key: 'info3_title', label: '重點三標題' },
  { key: 'info3_body', label: '重點三說明', type: 'textarea' },
];

function preprocess(body) {
  return preprocessEnsureNonEmpty(body, [{ key: 'title', label: '主標題' }]);
}

module.exports = createAdminCrudController({
  resourceSlug: 'home-hero',
  title: '首頁 Hero 區塊',
  service: homeHeroService,
  listFields,
  formFields,
  preprocess,
});

