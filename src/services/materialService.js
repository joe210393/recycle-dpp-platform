const { buildCrudService } = require('./crudServiceFactory');
const { materialModel } = require('../models/materialModel');

const materialService = buildCrudService(materialModel);

module.exports = { materialService };

