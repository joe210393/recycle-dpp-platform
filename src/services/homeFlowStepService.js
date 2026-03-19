const { buildCrudService } = require('./crudServiceFactory');
const { homeFlowStepModel } = require('../models/homeFlowStepModel');

const homeFlowStepService = buildCrudService(homeFlowStepModel);

module.exports = { homeFlowStepService };

