const { buildCrudService } = require('./crudServiceFactory');
const { documentModel } = require('../models/documentModel');

const documentService = buildCrudService(documentModel);

module.exports = { documentService };

