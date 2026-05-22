const { createAdminCrudController } = require('./crudControllerFactory');
const { productBatchMaterialBatchService } = require('../../services/productBatchMaterialBatchService');

const listFields = [
  { key: 'id', label: 'ID' },
  { key: 'product_batch_id', label: '商品批次 ID' },
  { key: 'material_id', label: '材料 ID' },
  { key: 'material_batch_id', label: '材料批次 ID' },
];

function withPrompt(options, prompt, emptyMessage) {
  if (options.length > 0) return [{ value: '', label: prompt }, ...options];
  return [{ value: '', label: emptyMessage }];
}

async function getFormFields(req, record) {
  const { productBatchService } = require('../../services/productBatchService');
  const { materialService } = require('../../services/materialService');
  const { materialBatchService } = require('../../services/materialBatchService');

  const [productBatches, materials, materialBatches] = await Promise.all([
    productBatchService.listAll(),
    materialService.listAll(),
    materialBatchService.listAll(),
  ]);

  const materialNameById = new Map(
    materials.map((m) => [String(m.id), `${m.name}${m.code ? `（${m.code}）` : ''}`])
  );

  const productBatchOptions = withPrompt(
    productBatches.map((b) => ({
      value: String(b.id),
      label: `${b.batch_no || '未命名批次'}（ID:${b.id}）`,
    })),
    '請選擇商品批次',
    '請先建立商品批次'
  );

  const materialOptions = withPrompt(
    materials.map((m) => ({
      value: String(m.id),
      label: `${m.name}${m.code ? `（${m.code}）` : ''}（ID:${m.id}）`,
    })),
    '請選擇材料',
    '請先建立材料主檔'
  );

  const materialBatchOptions = withPrompt(
    materialBatches.map((b) => {
      const materialLabel = materialNameById.get(String(b.material_id));
      const labelParts = [b.batch_no || '未命名批次'];
      if (materialLabel) labelParts.push(materialLabel);
      labelParts.push(`ID:${b.id}`);
      return {
        value: String(b.id),
        label: `${labelParts.join(' / ')}`,
      };
    }),
    '請選擇材料批次',
    '請先建立材料批次'
  );

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
});
