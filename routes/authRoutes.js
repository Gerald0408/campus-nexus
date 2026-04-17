const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

router.get('/register', auth.showRegister);
router.post('/api/auth/register', auth.register);

router.get('/login', auth.showLogin);
router.post('/api/auth/login', auth.login);

router.get('/logout', auth.logout);

module.exports = router;
