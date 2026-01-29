/**
 * Database Controller
 * Endpoints for testing database connectivity and viewing table stats.
 */

const asyncHandler = require('../utils/asyncHandler');
const db = require('../database/connection');
const { runMigrations } = require('../database/migrate');
const models = require('../models');

/**
 * GET /api/db/health
 * Tests database connectivity and returns latency.
 */
const getDbHealth = asyncHandler(async (req, res) => {
  const result = await db.testConnection();
  res.status(200).json({
    success: true,
    message: 'Database connection successful',
    data: result,
  });
});

/**
 * POST /api/db/migrate
 * Runs pending database migrations.
 */
const runDbMigrations = asyncHandler(async (req, res) => {
  await runMigrations();
  res.status(200).json({
    success: true,
    message: 'Migrations completed successfully',
  });
});

/**
 * GET /api/db/stats
 * Returns row counts for all tables.
 */
const getDbStats = asyncHandler(async (req, res) => {
  const [users, repositories, pullRequests, reviews, comments] = await Promise.all([
    models.User.count(),
    models.Repository.count(),
    models.PullRequest.count(),
    models.Review.count(),
    models.Comment.count(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      tables: {
        users,
        repositories,
        pull_requests: pullRequests,
        reviews,
        comments,
      },
      total: users + repositories + pullRequests + reviews + comments,
    },
  });
});

/**
 * GET /api/db
 * Returns database service overview.
 */
const getDbOverview = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Database API - use /health, /stats, /migrate endpoints',
    endpoints: {
      health: '/api/db/health',
      stats: '/api/db/stats',
      migrate: '/api/db/migrate',
    },
  });
});

module.exports = {
  getDbHealth,
  runDbMigrations,
  getDbStats,
  getDbOverview,
};
