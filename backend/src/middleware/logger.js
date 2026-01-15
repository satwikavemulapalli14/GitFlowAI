/**
 * Logger Middleware
 * Logs incoming requests with method, URL, status code, and duration.
 * Used alongside Morgan for structured logging.
 */

const logger = (req, res, next) => {
  const start = Date.now();

  // Capture the original end method to log after response is sent
  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    );
    return originalEnd.apply(this, args);
  };

  next();
};

module.exports = logger;
