const { buildCrudService } = require('./crudServiceFactory');
const { passportViewModel } = require('../models/passportViewModel');

const passportViewService = buildCrudService(passportViewModel);

module.exports = { passportViewService };

