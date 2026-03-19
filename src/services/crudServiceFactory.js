function buildCrudService(model) {
  return {
    list: (...args) => model.list(...args),
    listAll: (...args) => model.listAll(...args),
    getById: (...args) => model.getById(...args),
    create: (...args) => model.create(...args),
    update: (...args) => model.update(...args),
    remove: (...args) => model.remove(...args),
  };
}

module.exports = { buildCrudService };

