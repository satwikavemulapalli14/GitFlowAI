const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const reviewsController = require('../controllers/reviewsController');

router.get('/', authenticate, reviewsController.list);
router.get('/:id', authenticate, reviewsController.getById);
router.delete('/:id', authenticate, reviewsController.remove);

module.exports = { path: '/api/reviews', router };
