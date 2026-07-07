const authService = require('../services/authService');
const { User } = require('../models');

function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  const token = header.split(' ')[1];
  const decoded = authService.verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }

  // Attach JWT payload fields
  req.user = decoded;

  // Fetch the full user from DB to get the GitHub access token
  User.findById(decoded.sub)
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }
      req.user.accessToken = user.access_token;
      next();
    })
    .catch((err) => {
      console.error('[Auth] DB lookup failed:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Authentication error',
      });
    });
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;

  if (header && header.startsWith('Bearer ')) {
    const token = header.split(' ')[1];
    const decoded = authService.verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
}

module.exports = { authenticate, optionalAuth };
