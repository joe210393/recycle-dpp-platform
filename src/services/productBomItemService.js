const { buildCrudService } = require('./crudServiceFactory');
const { productBomItemModel } = require('../models/productBomItemModel');

const productBomItemService = buildCrudService(productBomItemModel);

module.exports = { productBomItemService };

