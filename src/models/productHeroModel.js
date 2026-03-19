const { buildCrudModel } = require('./crudModelFactory');

const productHeroModel = buildCrudModel({
  table: 'product_hero',
  columns: ['eyebrow', 'title', 'description', 'hero_image_path', 'created_at', 'updated_at'],
});

module.exports = { productHeroModel };

