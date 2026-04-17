const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const dash = require('../controllers/dashboardController');

router.get('/dashboard', isAuthenticated, dash.dashboard);
router.get('/students',  isAuthenticated, dash.students);
router.get('/admission', isAuthenticated, dash.admission);
router.get('/academic',  isAuthenticated, dash.academic);
router.get('/fees',      isAuthenticated, dash.fees);
router.get('/profile',   isAuthenticated, dash.profile);
router.get('/settings',  isAuthenticated, dash.settings);

module.exports = router;
