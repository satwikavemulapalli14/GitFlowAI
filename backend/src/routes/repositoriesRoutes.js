const express = require('express');
const repositoriesController = require('../controllers/repositoriesController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, repositoriesController.list);

module.exports = {
  path: '/api/repositories',
  router,
};
