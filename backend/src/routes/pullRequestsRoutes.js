const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const pullRequestsController = require('../controllers/pullRequestsController');

router.get('/:owner/:repo/pullrequests', authenticate, pullRequestsController.list);
router.get('/:owner/:repo/pullrequests/:prNumber', authenticate, pullRequestsController.getByNumber);

module.exports = { path: '/api/repositories', router };
