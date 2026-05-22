const { createAdminCrudController } = require('./crudControllerFactory');
const { productVersionService } = require('../../services/productVersionService');
const {
  decorateRowsWithReferences,
  getReferenceOptions,
} = require('../../utils/adminRelationLabels');

const listFields = [
  { key: 'id', label: 'ID' },
  { key: 'product_label', label: '商品' },
  { key: 'version_no', label: '版本號' },
  { key: 'version_name', label: '版本名稱' },
  { key: 'effective_date', label: '生效日期' },
  { key: 'status', label: '狀態' },
];

async function formFields() {
  return [
    {
      key: 'product_id',
      label: '商品',
      type: 'select',
      options: await getReferenceOptions('product', '請選擇商品', '請先建立商品'),
      required: true,
    },
    { key: 'version_no', label: '版本號', required: true },
    { key: 'version_name', label: '版本名稱' },
    { key: 'effective_date', label: '生效日期', type: 'date' },
    { key: 'note', label: '備註', type: 'textarea' },
    {
      key: 'status',
      label: '狀態',
      type: 'select',
      options: [
        { value: 'draft', label: '草稿' },
        { value: 'active', label: '啟用' },
        { value: 'inactive', label: '停用' },
      ],
    },
  ];
}

module.exports = createAdminCrudController({
  resourceSlug: 'product-versions',
  title: '商品版本',
  service: productVersionService,
  listFields,
  formFields,
  decorateRows: (rows) =>
    decorateRowsWithReferences(rows, [
      { sourceKey: 'product_id', targetKey: 'product_label', type: 'product' },
    ]),
});
