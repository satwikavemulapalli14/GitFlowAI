const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

router.get('/stats', authenticate, analyticsController.stats);

module.exports = { path: '/api/analytics', router };
