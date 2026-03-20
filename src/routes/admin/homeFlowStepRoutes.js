const express = require('express');

const router = express.Router();

const controller = require('../../controllers/admin/homeFlowStepAdminController');
const { validateRequest } = require('../../middlewares/validateMiddleware');
const { imageUpload } = require('../../middlewares/imageUploadMiddleware');

router.get('/', controller.list);
router.get('/new', controller.showNew);
router.post('/', ...imageUpload(['icon_path']), validateRequest, controller.create);
router.get('/:id/edit', controller.showEdit);
router.post('/:id/update', ...imageUpload(['icon_path']), validateRequest, controller.update);
router.put('/:id', ...imageUpload(['icon_path']), validateRequest, controller.update);
router.delete('/:id', controller.remove);

module.exports = router;

