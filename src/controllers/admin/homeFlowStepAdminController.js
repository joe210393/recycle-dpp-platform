const { createAdminCrudController } = require('./crudControllerFactory');
const { homeFlowStepService } = require('../../services/homeFlowStepService');

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

/** 空欄位經 sanitize 會變 NULL，INSERT 會覆蓋 DB DEFAULT；sort_order 為 NOT NULL，需給預設值 */
function preprocess(body) {
  const b = { ...(body || {}) };
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

