/**
 * Migration Runner
 * Reads SQL migration files from the migrations/ directory and executes them
 * against the database in order.
 *
 * Usage:
 *   node src/database/migrate.js
 *
 * Or imported and called programmatically:
 *   const { runMigrations } = require('./database/migrate');
 *   await runMigrations();
 */

const fs = require('fs');
const path = require('path');
const { query, pool } = require('./connection');

const MIGRATIONS_DIR = path.resolve(__dirname, 'migrations');

/**
 * Track applied migrations in a meta table.
 */
const ensureMetaTable = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id          SERIAL PRIMARY KEY,
      filename    VARCHAR(255) NOT NULL UNIQUE,
      applied_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);
};

const getAppliedMigrations = async () => {
  const result = await query('SELECT filename FROM _migrations ORDER BY id');
  return new Set(result.rows.map((r) => r.filename));
};

const markApplied = async (filename) => {
  await query('INSERT INTO _migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING', [filename]);
};

/**
 * Run all pending migrations.
 */
const runMigrations = async () => {
  await ensureMetaTable();
  const applied = await getAppliedMigrations();

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  let count = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  SKIP ${file} (already applied)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    console.log(`  RUN  ${file}...`);
    await query(sql);
    await markApplied(file);
    count++;
  }

  console.log(`\n  ${count} migration(s) applied.`);
};

// Run directly from CLI
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('\n✅ Migrations complete');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n❌ Migration failed:', err.message);
      process.exit(1);
    });
}

module.exports = { runMigrations };
