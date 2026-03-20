const { createAdminCrudController } = require('./crudControllerFactory');
const { homeFlowStepService } = require('../../services/homeFlowStepService');
const { preprocessEnsureNonEmpty } = require('../../utils/preprocessEnsureNonEmpty');

const listFields = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: '步驟標題' },
  { key: 'sort_order', label: '顯示順序' },
];

const formFields = [
  { key: 'title', label: '步驟標題', required: true },
  { key: 'description', label: '步驟說明', type: 'textarea' },
  { key: 'icon_path', label: '圖示圖片路徑（可空白）' },
  { key: 'sort_order', label: '顯示順序（數字越小越前面）', type: 'number' },
];

/** title NOT NULL；sort_order 空值經 sanitize 會變 NULL，需預設 */
function preprocess(body) {
  const b = preprocessEnsureNonEmpty(body, [{ key: 'title', label: '步驟標題' }]);
  if (b.sort_order === '' || b.sort_order == null) {
    b.sort_order = '0';
  } else {
    const n = Number(b.sort_order);
    b.sort_order = Number.isFinite(n) ? String(Math.trunc(n)) : '0';
  }
  return b;
}

module.exports = createAdminCrudController({
  resourceSlug: 'home-flow-steps',
  title: '首頁流程區塊',
  service: homeFlowStepService,
  listFields,
  formFields,
  preprocess,
});

