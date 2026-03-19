const { buildCrudService } = require('./crudServiceFactory');
const { productModel } = require('../models/productModel');

const productService = buildCrudService(productModel);

module.exports = { productService };

