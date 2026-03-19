const { createAdminCrudController } = require('./crudControllerFactory');
const { productBomItemService } = require('../../services/productBomItemService');

const listFields = [
  { key: 'id', label: 'ID' },
  { key: 'product_version_id', label: '商品版本 ID' },
  { key: 'material_id', label: '材料 ID' },
  { key: 'material_role', label: '材料角色' },
  { key: 'sort_order', label: '顯示順序' },
  { key: 'public_visible', label: '是否公開' },
];

const formFields = [
  { key: 'product_version_id', label: '商品版本 ID', type: 'number', required: true },
  { key: 'material_id', label: '材料 ID', type: 'number', required: true },
  { key: 'material_role', label: '材料角色' },
  { key: 'sort_order', label: '顯示順序', type: 'number' },
  { key: 'public_visible', label: '是否公開', type: 'checkbox' },
  { key: 'note', label: '備註', type: 'textarea' },
];

module.exports = createAdminCrudController({
  resourceSlug: 'product-bom',
  title: '商品 BOM（組成）',
  service: productBomItemService,
  listFields,
  formFields,
});

