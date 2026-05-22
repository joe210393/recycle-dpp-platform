const { createAdminCrudController } = require('./crudControllerFactory');
const { productBatchMaterialBatchService } = require('../../services/productBatchMaterialBatchService');
const {
  decorateRowsWithReferences,
  getReferenceOptions,
} = require('../../utils/adminRelationLabels');

const listFields = [
  { key: 'id', label: 'ID' },
  { key: 'product_batch_label', label: '商品批次' },
  { key: 'material_label', label: '材料' },
  { key: 'material_batch_label', label: '材料批次' },
];

async function getFormFields(req, record) {
  const [productBatchOptions, materialOptions, materialBatchOptions] = await Promise.all([
    getReferenceOptions('productBatch', '請選擇商品批次', '請先建立商品批次'),
    getReferenceOptions('material', '請選擇材料', '請先建立材料主檔'),
    getReferenceOptions('materialBatch', '請選擇材料批次', '請先建立材料批次'),
  ]);

  return [
    {
      key: 'product_batch_id',
      label: '商品批次',
      type: 'select',
      options: productBatchOptions,
      required: true,
      helpText: '若沒有資料，請先建立商品批次。',
      helpLink: { href: '/admin/product-batches/new', label: '新增商品批次' },
      showAddButton: false,
    },
    {
      key: 'material_id',
      label: '材料',
      type: 'select',
      options: materialOptions,
      required: true,
      helpText: '若沒有資料，請先建立材料主檔。',
      helpLink: { href: '/admin/materials/new', label: '新增材料' },
      showAddButton: false,
    },
    {
      key: 'material_batch_id',
      label: '材料批次',
      type: 'select',
      options: materialBatchOptions,
      required: true,
      helpText: '請選擇實際使用的材料批次。',
      helpLink: { href: '/admin/material-batches/new', label: '新增材料批次' },
      showAddButton: false,
    },
    { key: 'note', label: '備註', type: 'textarea' },
  ];
}

module.exports = createAdminCrudController({
  resourceSlug: 'product-batch-material-batches',
  title: '商品用料鏈結',
  service: productBatchMaterialBatchService,
  listFields,
  formFields: getFormFields,
  decorateRows: (rows) =>
    decorateRowsWithReferences(rows, [
      { sourceKey: 'product_batch_id', targetKey: 'product_batch_label', type: 'productBatch' },
      { sourceKey: 'material_id', targetKey: 'material_label', type: 'material' },
      { sourceKey: 'material_batch_id', targetKey: 'material_batch_label', type: 'materialBatch' },
    ]),
});
