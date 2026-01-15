/**
 * 404 Handler
 * Catches all unmatched routes and returns a consistent JSON response.
 * Must be registered after all route definitions.
 */

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

module.exports = notFoundHandler;
