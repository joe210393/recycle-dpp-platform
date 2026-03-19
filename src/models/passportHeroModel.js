const { buildCrudModel } = require('./crudModelFactory');

const passportHeroModel = buildCrudModel({
  table: 'passport_hero',
  columns: ['eyebrow', 'title', 'description', 'hero_image_path', 'created_at', 'updated_at'],
});

module.exports = { passportHeroModel };

