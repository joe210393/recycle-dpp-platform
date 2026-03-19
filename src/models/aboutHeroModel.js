const { buildCrudModel } = require('./crudModelFactory');

const aboutHeroModel = buildCrudModel({
  table: 'about_hero',
  columns: ['eyebrow', 'title', 'description', 'hero_image_path', 'created_at', 'updated_at'],
});

module.exports = { aboutHeroModel };

