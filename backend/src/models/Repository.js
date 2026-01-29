/**
 * Repository Model
 * CRUD operations for the repositories table.
 */

const db = require('../database/connection');

const Repository = {
  table: 'repositories',

  columns: `
    id, github_id, name, full_name, description, url,
    default_branch, owner_id, is_active, created_at, updated_at
  `,

  async findAll() {
    const result = await db.query(
      `SELECT ${this.columns} FROM ${this.table} ORDER BY updated_at DESC`
    );
    return result.rows;
  },

  async findById(id) {
    const result = await db.query(
      `SELECT ${this.columns} FROM ${this.table} WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async findByGithubId(githubId) {
    const result = await db.query(
      `SELECT ${this.columns} FROM ${this.table} WHERE github_id = $1`,
      [githubId]
    );
    return result.rows[0] || null;
  },

  async findByOwner(ownerId) {
    const result = await db.query(
      `SELECT ${this.columns} FROM ${this.table} WHERE owner_id = $1 ORDER BY name`,
      [ownerId]
    );
    return result.rows;
  },

  async findByFullName(fullName) {
    const result = await db.query(
      `SELECT ${this.columns} FROM ${this.table} WHERE full_name = $1`,
      [fullName]
    );
    return result.rows[0] || null;
  },

  async create(data) {
    const { github_id, name, full_name, description, url, default_branch, owner_id, is_active } = data;
    const result = await db.query(
      `INSERT INTO ${this.table}
        (github_id, name, full_name, description, url, default_branch, owner_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${this.columns}`,
      [github_id || null, name, full_name, description || null, url || null, default_branch || 'main', owner_id, is_active !== false]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      if (['name', 'full_name', 'description', 'url', 'default_branch', 'is_active'].includes(key)) {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await db.query(
      `UPDATE ${this.table} SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING ${this.columns}`,
      values
    );
    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await db.query(
      `DELETE FROM ${this.table} WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rows[0] || null;
  },

  async count() {
    const result = await db.query(`SELECT COUNT(*)::int AS count FROM ${this.table}`);
    return result.rows[0].count;
  },

  async countByOwner(ownerId) {
    const result = await db.query(
      `SELECT COUNT(*)::int AS count FROM ${this.table} WHERE owner_id = $1`,
      [ownerId]
    );
    return result.rows[0].count;
  },
};

module.exports = Repository;
