/**
 * Express Application
 * Configures middleware stack and registers routes.
 * Separated from server.js so the app can be imported for testing.
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const logger = require('./middleware/logger');
const registerRoutes = require('./routes');
const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ---------------------------------------------------------------------------
// Security Middleware
// ---------------------------------------------------------------------------
app.use(helmet());

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
app.use(cors(config.cors));

// ---------------------------------------------------------------------------
// Body Parsing
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Request Logging
// ---------------------------------------------------------------------------
if (config.env === 'development') {
  app.use(morgan('dev'));
}
app.use(logger);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Root welcome
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to GitFlowAI API',
    version: config.api.version,
  });
});

// Auto-register all route modules
registerRoutes(app);

// ---------------------------------------------------------------------------
// Error Handling (must be registered last)
// ---------------------------------------------------------------------------
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
