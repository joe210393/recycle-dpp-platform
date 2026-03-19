const { buildCrudService } = require('./crudServiceFactory');
const { homeHeroModel } = require('../models/homeHeroModel');

const homeHeroService = buildCrudService(homeHeroModel);

module.exports = { homeHeroService };

