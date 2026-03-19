const { buildCrudModel } = require('./crudModelFactory');

const homeFlowStepModel = buildCrudModel({
  table: 'home_flow_steps',
  columns: ['title', 'description', 'icon_path', 'sort_order', 'created_at', 'updated_at'],
});

module.exports = { homeFlowStepModel };

