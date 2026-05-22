const { createAdminCrudController } = require('./crudControllerFactory');
const { productBomItemService } = require('../../services/productBomItemService');
const {
  decorateRowsWithReferences,
  getReferenceOptions,
} = require('../../utils/adminRelationLabels');

const listFields = [
  { key: 'id', label: 'ID' },
  { key: 'product_version_label', label: '商品版本' },
  { key: 'material_label', label: '材料' },
  { key: 'material_role', label: '材料角色' },
  { key: 'sort_order', label: '顯示順序' },
  { key: 'public_visible', label: '是否公開' },
];

async function formFields() {
  const [productVersionOptions, materialOptions] = await Promise.all([
    getReferenceOptions('productVersion', '請選擇商品版本', '請先建立商品版本'),
    getReferenceOptions('material', '請選擇材料', '請先建立材料主檔'),
  ]);

  return [
    {
      key: 'product_version_id',
      label: '商品版本',
      type: 'select',
      options: productVersionOptions,
      required: true,
    },
    {
      key: 'material_id',
      label: '材料',
      type: 'select',
      options: materialOptions,
      required: true,
    },
    { key: 'material_role', label: '材料角色' },
    { key: 'sort_order', label: '顯示順序', type: 'number' },
    { key: 'public_visible', label: '是否公開', type: 'checkbox' },
    { key: 'note', label: '備註', type: 'textarea' },
  ];
}

module.exports = createAdminCrudController({
  resourceSlug: 'product-bom',
  title: '商品 BOM（組成）',
  service: productBomItemService,
  listFields,
  formFields,
  decorateRows: (rows) =>
    decorateRowsWithReferences(rows, [
      {
        sourceKey: 'product_version_id',
        targetKey: 'product_version_label',
        type: 'productVersion',
      },
      { sourceKey: 'material_id', targetKey: 'material_label', type: 'material' },
    ]),
});
