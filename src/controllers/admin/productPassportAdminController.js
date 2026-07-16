const { createAdminCrudController } = require('./crudControllerFactory');
const { productPassportService } = require('../../services/productPassportService');
const {
  listDocumentOptionsForPassport,
  syncPassportDocuments,
} = require('../../services/passportDocumentService');
const {
  decorateRowsWithReferences,
  getReferenceOptions,
} = require('../../utils/adminRelationLabels');

const listFields = [
  { key: 'id', label: 'ID' },
  { key: 'passport_code', label: '護照代碼' },
  { key: 'product_label', label: '商品' },
  { key: 'product_version_label', label: '商品版本' },
  { key: 'product_batch_label', label: '商品批次' },
  { key: 'status', label: '狀態' },
  { key: 'public_url', label: '公開網址' },
];

async function formFields(req, record) {
  const [productOptions, productVersionOptions, productBatchOptions] = await Promise.all([
    getReferenceOptions('product', '請選擇商品', '請先建立商品'),
    getReferenceOptions('productVersion', '請選擇商品版本', '請先建立商品版本'),
    getReferenceOptions('productBatch', '請選擇商品批次', '請先建立商品批次'),
  ]);

  // 文件複選只在編輯頁提供（建立時尚無護照 ID 可綁定）。
  const documentField =
    record && record.id
      ? [
          {
            key: 'document_ids',
            label: '文件附件（可複選）',
            type: 'multicheckbox',
            helpText:
              '勾選要綁定到此護照的文件；取消勾選會解除綁定。目前前台各檢視（consumer / b2b / audit）都會顯示全部綁定文件。',
            options: await listDocumentOptionsForPassport(record.id),
            emptyMessage: '目前沒有文件，請先到「文件附件」建立。',
          },
        ]
      : [];

  return [
    { key: 'product_id', label: '商品', type: 'select', options: productOptions, required: true },
    {
      key: 'product_version_id',
      label: '商品版本',
      type: 'select',
      options: productVersionOptions,
      required: true,
    },
    {
      key: 'product_batch_id',
      label: '商品批次',
      type: 'select',
      options: productBatchOptions,
      required: true,
    },
    { key: 'passport_code', label: '護照代碼', required: true },
    { key: 'public_url', label: '公開網址' },
    { key: 'qr_code_path', label: 'QR Code 圖片路徑' },
    {
      key: 'status',
      label: '狀態',
      type: 'select',
      options: [
        { value: 'draft', label: '草稿' },
        { value: 'published', label: '已發布' },
        { value: 'archived', label: '已歸檔' },
      ],
    },
    ...documentField,
  ];
}

const baseController = createAdminCrudController({
  resourceSlug: 'product-passports',
  title: '商品護照',
  service: productPassportService,
  listFields,
  formFields,
  decorateRows: (rows) =>
    decorateRowsWithReferences(rows, [
      { sourceKey: 'product_id', targetKey: 'product_label', type: 'product' },
      {
        sourceKey: 'product_version_id',
        targetKey: 'product_version_label',
        type: 'productVersion',
      },
      { sourceKey: 'product_batch_id', targetKey: 'product_batch_label', type: 'productBatch' },
    ]),
});

// 儲存護照時先同步文件綁定（sanitize 會把陣列壓成單值，所以在這裡先讀原始 body）。
async function update(req, res, next) {
  try {
    await syncPassportDocuments(req.params.id, req.body.document_ids);
  } catch (err) {
    return next(err);
  }
  return baseController.update(req, res, next);
}

module.exports = { ...baseController, update };
