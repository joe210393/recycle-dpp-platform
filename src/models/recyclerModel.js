const { buildCrudModel } = require('./crudModelFactory');

const recyclerModel = buildCrudModel({
  table: 'recyclers',
  columns: [
    'name',
    'code',
    'tax_id',
    'contact_person',
    'phone',
    'email',
    'address',
    'website',
    'certificate_no',
    'certificate_file',
    'public_note',
    'internal_note',
    'status',
    'created_at',
    'updated_at',
  ],
});

module.exports = { recyclerModel };

