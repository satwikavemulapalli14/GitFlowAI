const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const searchController = require('../controllers/searchController');

router.get('/', authenticate, searchController.global);
router.get('/repositories', authenticate, searchController.repositories);

module.exports = { path: '/api/search', router };
