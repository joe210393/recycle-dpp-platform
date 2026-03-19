const express = require('express');

const router = express.Router();

const controller = require('../../controllers/admin/passportHeroAdminController');

router.get('/', controller.list);
router.get('/new', controller.showNew);
router.post('/', controller.create);
router.get('/:id/edit', controller.showEdit);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;

