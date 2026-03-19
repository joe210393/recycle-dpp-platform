const express = require('express');

const router = express.Router();

const controller = require('../../controllers/admin/homeHeroAdminController');
const { validateRequest } = require('../../middlewares/validateMiddleware');

router.get('/', controller.list);
router.get('/new', controller.showNew);
router.post('/', validateRequest, controller.create);
router.get('/:id/edit', controller.showEdit);
router.put('/:id', validateRequest, controller.update);
router.delete('/:id', controller.remove);

module.exports = router;

