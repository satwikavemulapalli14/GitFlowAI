const express = require('express');
const router = express.Router();
const {
  getDbHealth,
  runDbMigrations,
  getDbStats,
  getDbOverview,
} = require('../controllers/dbController');

router.get('/', getDbOverview);
router.get('/health', getDbHealth);
router.get('/stats', getDbStats);
router.post('/migrate', runDbMigrations);

module.exports = { path: '/api/db', router };
