const { buildCrudService } = require('./crudServiceFactory');
const { processingRecordModel } = require('../models/processingRecordModel');

const processingRecordService = buildCrudService(processingRecordModel);

module.exports = { processingRecordService };

