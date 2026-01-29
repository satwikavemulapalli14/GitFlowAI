const jwt = require('jsonwebtoken');
const config = require('../config');

class AuthService {
  generateToken(user) {
    const payload = {
      sub: user.id,
      githubId: user.github_id,
      username: user.username,
      role: user.role,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch {
      return null;
    }
  }
}

module.exports = new AuthService();
