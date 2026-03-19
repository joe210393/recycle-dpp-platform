const { buildCrudService } = require('./crudServiceFactory');
const { aboutHeroModel } = require('../models/aboutHeroModel');

const aboutHeroService = buildCrudService(aboutHeroModel);

module.exports = { aboutHeroService };

