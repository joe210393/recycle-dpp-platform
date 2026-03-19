const { buildCrudService } = require('./crudServiceFactory');
const { productPassportModel } = require('../models/productPassportModel');

const productPassportService = buildCrudService(productPassportModel);

module.exports = { productPassportService };

