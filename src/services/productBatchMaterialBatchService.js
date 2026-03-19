const { buildCrudService } = require('./crudServiceFactory');
const { productBatchMaterialBatchModel } = require('../models/productBatchMaterialBatchModel');

const productBatchMaterialBatchService = buildCrudService(productBatchMaterialBatchModel);

module.exports = { productBatchMaterialBatchService };

