const { buildCrudModel } = require('./crudModelFactory');

const passportViewModel = buildCrudModel({
  table: 'passport_views',
  columns: ['product_passport_id', 'view_type', 'config_json', 'created_at', 'updated_at'],
});

module.exports = { passportViewModel };

