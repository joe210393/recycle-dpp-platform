const express = require('express');

const controller = require('../../controllers/admin/mediaUploadController');
const { singleImageUploadApi } = require('../../middlewares/mediaApiMiddleware');

const router = express.Router();

router.post('/media', singleImageUploadApi('file'), controller.create);

module.exports = router;
