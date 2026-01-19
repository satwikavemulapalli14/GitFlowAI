/**
 * Health Controller
 * Returns server health status.
 */

const asyncHandler = require('../utils/asyncHandler');
const healthService = require('../services/healthService');

/**
 * GET /api/health
 * Returns a simple health status with the current API version.
 */
const getHealth = asyncHandler(async (req, res) => {
  const health = healthService.getHealth();
  res.status(200).json(health);
});

module.exports = { getHealth };
