/**
 * Database Connection
 * Manages a PostgreSQL connection pool using the `pg` library.
 * All models import this module to execute queries.
 */

const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
  connectionString: config.database.url,
  max: config.database.pool.max,
  idleTimeoutMillis: config.database.pool.idleTimeoutMillis,
  connectionTimeoutMillis: config.database.pool.connectionTimeoutMillis,
});

// Log pool events in development
pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

pool.on('connect', () => {
  if (config.env === 'development') {
    console.log('[DB] New client connected');
  }
});

/**
 * Execute a SQL query with optional parameters.
 * Usage: db.query('SELECT * FROM users WHERE id = $1', [id]);
 */
const query = (text, params) => pool.query(text, params);

/**
 * Get a client from the pool for transactions.
 * Usage:
 *   const client = await db.getClient();
 *   await client.query('BEGIN');
 *   // ... queries
 *   await client.query('COMMIT');
 *   client.release();
 */
const getClient = () => pool.connect();

/**
 * Test database connectivity.
 * Returns { connected, latencyMs, version } or throws.
 */
const testConnection = async () => {
  const start = Date.now();
  const result = await query('SELECT version() AS version');
  const latency = Date.now() - start;
  return {
    connected: true,
    latencyMs: latency,
    version: result.rows[0].version,
  };
};

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
};
