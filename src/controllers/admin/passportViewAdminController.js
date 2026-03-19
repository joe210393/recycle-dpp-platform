const { createAdminCrudController } = require('./crudControllerFactory');
const { passportViewService } = require('../../services/passportViewService');
const { getDefaultConfig } = require('../../config/passportViews');

const listFields = [
  { key: 'id', label: 'ID' },
  { key: 'product_passport_id', label: '商品護照 ID' },
  { key: 'view_type', label: '顯示版本' },
  { key: 'created_at', label: '建立時間' },
];

const formFields = [
  { key: 'product_passport_id', label: '商品護照 ID', type: 'number', required: true },
  {
    key: 'view_type',
    label: '顯示版本',
    type: 'select',
    options: [
      { value: 'consumer', label: '消費者' },
      { value: 'b2b', label: '通路/夥伴' },
      { value: 'audit', label: '稽核' },
    ],
  },
  { key: 'config_json', label: '顯示設定（config_json，JSON）', type: 'textarea', required: true },
];

function preprocess(data) {
  const out = { ...data };
  if (typeof out.config_json === 'string') {
    const raw = out.config_json.trim();
    if (raw.length === 0) {
      out.config_json = JSON.stringify({}, null, 0);
    } else {
      // Ensure it is valid JSON for MySQL JSON column.
      const parsed = JSON.parse(raw);
      out.config_json = JSON.stringify(parsed);
    }
  }
  return out;
}

function newRecord() {
  return {
    view_type: 'consumer',
    config_json: JSON.stringify(getDefaultConfig('consumer'), null, 2),
  };
}

module.exports = createAdminCrudController({
  resourceSlug: 'passport-views',
  title: '護照顯示設定',
  service: passportViewService,
  listFields,
  formFields,
  preprocess,
  newRecord,
});

