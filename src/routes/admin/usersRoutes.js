const express = require('express');

const controller = require('../../controllers/admin/userAdminController');

const router = express.Router();

router.get('/', controller.list);
router.get('/new', controller.renderNew);
router.post('/', controller.create);
router.get('/:id/edit', controller.renderEdit);
router.put('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
