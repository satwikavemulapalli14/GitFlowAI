/**
 * Health Service
 * Encapsulates health-check business logic.
 */

const { version } = require('../../package.json');

class HealthService {
  /**
   * Returns a health status object.
   */
  getHealth() {
    return {
      status: 'OK',
      version,
    };
  }
}

module.exports = new HealthService();
