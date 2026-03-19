const { buildCrudService } = require('./crudServiceFactory');
const { productVersionModel } = require('../models/productVersionModel');

const productVersionService = buildCrudService(productVersionModel);

module.exports = { productVersionService };

