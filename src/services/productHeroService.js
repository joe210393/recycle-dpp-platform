const { buildCrudService } = require('./crudServiceFactory');
const { productHeroModel } = require('../models/productHeroModel');

const productHeroService = buildCrudService(productHeroModel);

module.exports = { productHeroService };

