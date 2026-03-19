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

module.exports = createAdminCrudController({
  resourceSlug: 'home-flow-steps',
  title: '首頁流程區塊',
  service: homeFlowStepService,
  listFields,
  formFields,
});

