const express = require('express');

const router = express.Router();

const controller = require('../../controllers/admin/passportHeroAdminController');
const { validateRequest } = require('../../middlewares/validateMiddleware');
const { imageUpload } = require('../../middlewares/imageUploadMiddleware');

router.get('/', controller.list);
router.get('/new', controller.showNew);
router.post('/', ...imageUpload(['hero_image_path']), validateRequest, controller.create);
router.get('/:id/edit', controller.showEdit);
router.post('/:id/update', ...imageUpload(['hero_image_path']), validateRequest, controller.update);
router.put('/:id', ...imageUpload(['hero_image_path']), validateRequest, controller.update);
router.delete('/:id', controller.remove);

module.exports = router;

