const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const profileController = require('../controllers/profileController');

router.get('/', authenticate, profileController.index);
router.get('/settings', authenticate, profileController.getSettings);
router.put('/settings', authenticate, profileController.updateSettings);

module.exports = { path: '/api/profile', router };
