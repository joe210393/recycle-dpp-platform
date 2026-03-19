const { buildCrudService } = require('./crudServiceFactory');
const { materialBatchModel } = require('../models/materialBatchModel');

const materialBatchService = buildCrudService(materialBatchModel);

module.exports = { materialBatchService };

