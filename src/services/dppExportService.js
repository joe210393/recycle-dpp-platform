const { buildCrudService } = require('./crudServiceFactory');
const { dppExportModel } = require('../models/dppExportModel');

const dppExportService = buildCrudService(dppExportModel);

module.exports = { dppExportService };

