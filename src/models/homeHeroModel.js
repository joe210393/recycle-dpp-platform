const { buildCrudModel } = require('./crudModelFactory');

const homeHeroModel = buildCrudModel({
  table: 'home_hero',
  columns: [
    'eyebrow',
    'title',
    'description',
    'primary_button_text',
    'primary_button_url',
    'secondary_button_text',
    'secondary_button_url',
    'hero_image_path',
    'info1_title',
    'info1_body',
    'info2_title',
    'info2_body',
    'info3_title',
    'info3_body',
    'created_at',
    'updated_at',
  ],
});

module.exports = { homeHeroModel };

