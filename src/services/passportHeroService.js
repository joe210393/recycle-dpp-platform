const { buildCrudService } = require('./crudServiceFactory');
const { passportHeroModel } = require('../models/passportHeroModel');

const passportHeroService = buildCrudService(passportHeroModel);

module.exports = { passportHeroService };

