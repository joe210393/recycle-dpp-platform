const { buildCrudService } = require('./crudServiceFactory');
const { recyclerModel } = require('../models/recyclerModel');

const recyclerService = buildCrudService(recyclerModel);

module.exports = { recyclerService };

