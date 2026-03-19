const { buildCrudService } = require('./crudServiceFactory');
const { productBatchModel } = require('../models/productBatchModel');

const productBatchService = buildCrudService(productBatchModel);

module.exports = { productBatchService };

