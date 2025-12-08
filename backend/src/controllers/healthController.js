/**
 * Health Controller
 * Provides endpoints to verify the server is running and healthy.
 */

const os = require('os');

/**
 * GET /api/health
 * Returns the health status of the server.
 */
const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      platform: os.platform(),
      memoryUsage: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
      },
    },
  });
};

module.exports = { getHealth };
