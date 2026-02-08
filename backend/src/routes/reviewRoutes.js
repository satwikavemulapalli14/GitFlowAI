const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

router.post('/review', authenticate, reviewController.create);
router.get('/review', authenticate, reviewController.getByPullRequest);
router.get('/reviews', authenticate, reviewController.dashboard);

module.exports = { path: '/api', router };
