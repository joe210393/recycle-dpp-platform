const { sanitizeFormBody } = require('../../utils/sanitizeFormBody');

function createAdminCrudController({
  resourceSlug,
  title,
  service,
  listFields,
  formFields,
  preprocess = (data) => data,
  newRecord = {},
  decorateRows = (rows) => rows,
}) {
  function sanitizeBody(data) {
    return sanitizeFormBody(data);
  }

  // 含圖片欄位時，存檔後導回編輯頁能立刻看到新預覽；否則回列表頁。
  const hasImageField = (fields) =>
    Array.isArray(fields) && fields.some((f) => f && f.type === 'image');

  async function list(req, res, next) {
    try {
      const limit = Number(req.query.limit || 20);
      const page = Number(req.query.page || 1);
      const offset = (page - 1) * limit;
      const rows = await decorateRows(await service.list({ limit, offset }), req);
      return res.render('admin/layout', {
        view: 'crud/list',
        title,
        resourceSlug,
        listFields,
        rows,
        query: req.query,
        page,
        limit,
      });
    } catch (err) {
      return next(err);
    }
  }

  async function showNew(req, res, next) {
    try {
      const resolvedFormFields = typeof formFields === 'function' ? await formFields(req, null) : formFields;
      return res.render('admin/layout', {
        view: 'crud/form',
        title: `建立${title}`,
        resourceSlug,
        formFields: resolvedFormFields,
        record: typeof newRecord === 'function' ? newRecord(req) : newRecord,
        mode: 'create',
        query: req.query,
      });
    } catch (err) {
      return next(err);
    }
  }

  async function create(req, res, next) {
    try {
      if (req.uploadError) {
        throw new Error(req.uploadError);
      }
      const preprocessed = await preprocess(req.body, req);
      const data = sanitizeBody(preprocessed);
      const result = await service.create(data);
      const resolvedFormFields =
        typeof formFields === 'function' ? await formFields(req, null) : formFields;
      // 有圖片欄位時導回編輯頁，方便立即確認預覽；否則回列表
      if (result && result.id && hasImageField(resolvedFormFields)) {
        return res.redirect(`/admin/${resourceSlug}/${result.id}/edit?saved=1`);
      }
      return res.redirect(`/admin/${resourceSlug}?saved=1`);
    } catch (err) {
      const resolvedFormFields =
        typeof formFields === 'function' ? await formFields(req, null) : formFields;
      const base =
        typeof newRecord === 'function' ? newRecord(req) : { ...(newRecord || {}) };
      const record = { ...base, ...(req.body || {}) };
      return res.render('admin/layout', {
        view: 'crud/form',
        title: `建立${title}`,
        resourceSlug,
        formFields: resolvedFormFields,
        record,
        mode: 'create',
        error: err && err.message ? err.message : '發生錯誤',
        query: req.query,
      });
    }
  }

  async function showEdit(req, res, next) {
    try {
      const id = req.params.id;
      const record = await service.getById(id);
      if (!record) return res.status(404).send('Not found');
      const resolvedFormFields = typeof formFields === 'function' ? await formFields(req, record) : formFields;
      return res.render('admin/layout', {
        view: 'crud/form',
        title: `編輯${title}`,
        resourceSlug,
        formFields: resolvedFormFields,
        record,
        mode: 'edit',
        query: req.query,
      });
    } catch (err) {
      return next(err);
    }
  }

  async function update(req, res, next) {
    try {
      if (req.uploadError) {
        throw new Error(req.uploadError);
      }
      const id = req.params.id;
      const preprocessed = await preprocess(req.body, req);
      const data = sanitizeBody(preprocessed);
      await service.update(id, data);
      const resolvedFormFields =
        typeof formFields === 'function' ? await formFields(req, null) : formFields;
      // 有圖片欄位時導回編輯頁，方便立即確認預覽；否則回列表
      if (hasImageField(resolvedFormFields)) {
        return res.redirect(`/admin/${resourceSlug}/${id}/edit?saved=1`);
      }
      return res.redirect(`/admin/${resourceSlug}?saved=1`);
    } catch (err) {
      const id = req.params.id;
      let record = {};
      try {
        record = (await service.getById(id)) || {};
      } catch (e) {
        record = {};
      }
      const resolvedFormFields =
        typeof formFields === 'function' ? await formFields(req, record) : formFields;
      const merged = { ...record, ...(req.body || {}) };
      return res.render('admin/layout', {
        view: 'crud/form',
        title: `編輯${title}`,
        resourceSlug,
        formFields: resolvedFormFields,
        record: merged,
        mode: 'edit',
        error: err && err.message ? err.message : '發生錯誤',
        query: req.query,
      });
    }
  }

  async function remove(req, res, next) {
    try {
      const id = req.params.id;
      await service.remove(id);
      return res.redirect(`/admin/${resourceSlug}`);
    } catch (err) {
      return next(err);
    }
  }

  return {
    list,
    showNew,
    create,
    showEdit,
    update,
    remove,
  };
}

module.exports = { createAdminCrudController, sanitizeFormBody };
