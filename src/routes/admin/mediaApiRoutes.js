const express = require('express');

const controller = require('../../controllers/admin/mediaUploadController');
const {
  singleImageUploadApi,
  singleDocumentUploadApi,
} = require('../../middlewares/mediaApiMiddleware');

const router = express.Router();

router.post('/media', singleImageUploadApi('file'), controller.create);
router.post('/media/document', singleDocumentUploadApi('file'), controller.create);

module.exports = router;
