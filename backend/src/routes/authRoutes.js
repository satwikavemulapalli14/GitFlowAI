const express = require('express');
const passport = require('../services/passport');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GitHub OAuth login
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email', 'repo'] })
);

// GitHub OAuth callback — Passport exchanges code for token & fetches profile
router.get(
  '/github/callback',
  (req, res, next) => {
    req.frontendUrl = req.query.state || 'http://localhost:5173';
    next();
  },
  passport.authenticate('github', {
    failureRedirect: 'http://localhost:5173/login?error=github_auth_failed',
  }),
  authController.githubCallback
);

// Get current user profile
router.get('/me', authenticate, authController.me);

// Logout
router.post('/logout', authenticate, authController.logout);

module.exports = {
  path: '/api/auth',
  router,
};
