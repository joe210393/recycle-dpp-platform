const { sanitizeFormBody } = require('./crudControllerFactory');
const { processingRecordService } = require('../../services/processingRecordService');
const { recycledBatchService } = require('../../services/recycledBatchService');
const { materialService } = require('../../services/materialService');
const processingRecordWorkflowService = require('../../services/processingRecordWorkflowService');

const listFields = [
  { key: 'id', label: '編號' },
  { key: 'process_no', label: '處理單號' },
  { key: 'recycled_batch_id', label: '回收批次 ID' },
  { key: 'quantity_used', label: '本次使用數量' },
  { key: 'process_method', label: '處理方式' },
  { key: 'process_date', label: '處理日期時間' },
  { key: 'status', label: '狀態' },
];

async function list(req, res, next) {
  try {
    const limit = Number(req.query.limit || 20);
    const page = Number(req.query.page || 1);
    const offset = (page - 1) * limit;
    const rows = await processingRecordService.list({ limit, offset });
    return res.render('admin/layout', {
      view: 'crud/list',
      title: '處理紀錄',
      resourceSlug: 'processing-records',
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
    const batches = await recycledBatchService.listAll();
    const materials = await materialService.listAll();
    return res.render('admin/layout', {
      view: 'admin/processingRecords/form',
      title: '建立處理紀錄',
      resourceSlug: 'processing-records',
      mode: 'create',
      record: {},
      batchesWithRemaining: batches,
      materials,
      materialLines: [],
    });
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = sanitizeFormBody(req.body);
    await processingRecordWorkflowService.createFromForm(data);
    return res.redirect('/admin/processing-records');
  } catch (err) {
    return next(err);
  }
}

async function showEdit(req, res, next) {
  try {
    const id = req.params.id;
    const record = await processingRecordService.getById(id);
    if (!record) return res.status(404).send('Not found');
    const batches = await recycledBatchService.listAll();
    const materials = await materialService.listAll();
    const materialLines = await processingRecordWorkflowService.listMaterialOutputsForProcessingRecord(
      id
    );
    return res.render('admin/layout', {
      view: 'admin/processingRecords/form',
      title: '編輯處理紀錄',
      resourceSlug: 'processing-records',
      mode: 'edit',
      record,
      batchesWithRemaining: batches,
      materials,
      materialLines,
    });
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = req.params.id;
    const data = sanitizeFormBody(req.body);
    await processingRecordWorkflowService.updateFromForm(id, data);
    return res.redirect('/admin/processing-records');
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = req.params.id;
    await processingRecordWorkflowService.deleteWithCascade(id);
    return res.redirect('/admin/processing-records');
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  list,
  showNew,
  create,
  showEdit,
  update,
  remove,
};
