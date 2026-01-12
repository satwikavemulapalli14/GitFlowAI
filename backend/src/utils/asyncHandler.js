/**
 * Async Handler
 * Wraps async route handlers to catch rejected promises and forward them
 * to the Express error-handling middleware.
 *
 * Usage:
 *   router.get('/path', asyncHandler(async (req, res, next) => { ... }));
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
