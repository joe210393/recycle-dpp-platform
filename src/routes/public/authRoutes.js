const express = require('express');

const authController = require('../../controllers/authController');
const { requireAuthenticated } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/logout', authController.postLogout);

router.get('/register/shop-sale', authController.getStaffRegister);
router.post('/register/shop-sale', authController.postStaffRegister);

router.get('/register/user', authController.getUserRegister);
router.post('/register/user', authController.postUserRegister);

router.get('/account', requireAuthenticated, authController.getAccount);

module.exports = router;
