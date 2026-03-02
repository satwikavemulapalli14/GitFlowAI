const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const exportController = require('../controllers/exportController');

router.get('/:id/export/pdf', authenticate, exportController.exportPDF);
router.get('/:id/export/markdown', authenticate, exportController.exportMarkdown);

module.exports = { path: '/api/reviews', router };
