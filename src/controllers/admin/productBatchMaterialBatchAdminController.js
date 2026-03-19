const { createAdminCrudController } = require('./crudControllerFactory');
const { productBatchMaterialBatchService } = require('../../services/productBatchMaterialBatchService');

const listFields = [
  { key: 'id', label: 'ID' },
  { key: 'product_batch_id', label: '商品批次 ID' },
  { key: 'material_id', label: '材料 ID' },
  { key: 'material_batch_id', label: '材料批次 ID' },
];

const formFields = [
  { key: 'product_batch_id', label: '商品批次 ID', type: 'number', required: true },
  { key: 'material_id', label: '材料 ID', type: 'number', required: true },
  { key: 'material_batch_id', label: '材料批次 ID', type: 'number', required: true },
  { key: 'note', label: '備註', type: 'textarea' },
];

module.exports = createAdminCrudController({
  resourceSlug: 'product-batch-material-batches',
  title: '商品用料鏈結',
  service: productBatchMaterialBatchService,
  listFields,
  formFields,
});

