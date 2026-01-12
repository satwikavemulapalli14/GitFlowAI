/**
 * Environment Configuration
 * Loads and validates environment variables.
 * Provides a single source of truth for all configuration values.
 */

const dotenv = require('dotenv');
const path = require('path');

// Load .env from the backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  nodeEnv: process.env.NODE_ENV || 'development', // backward compat
  port: parseInt(process.env.PORT, 10) || 5001,

  api: {
    prefix: '/api',
    version: '1.0.0',
  },

  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:4173',
    ],
    credentials: true,
  },

  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/gitflowai',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackUrl: process.env.GITHUB_CALLBACK_URL,
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
};

module.exports = config;
