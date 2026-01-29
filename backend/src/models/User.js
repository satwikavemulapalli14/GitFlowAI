/**
 * User Model
 * CRUD operations for the users table.
 */

const db = require('../database/connection');

const User = {
  table: 'users',

  columns: `
    id, github_id, username, email, avatar_url,
    display_name, bio, role, created_at, updated_at
  `,

  async findAll() {
    const result = await db.query(
      `SELECT ${this.columns} FROM ${this.table} ORDER BY created_at DESC`
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

  async findByUsername(username) {
    const result = await db.query(
      `SELECT ${this.columns} FROM ${this.table} WHERE username = $1`,
      [username]
    );
    return result.rows[0] || null;
  },

  async create(data) {
    const { github_id, username, email, avatar_url, display_name, bio, role } = data;
    const result = await db.query(
      `INSERT INTO ${this.table}
        (github_id, username, email, avatar_url, display_name, bio, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${this.columns}`,
      [github_id || null, username, email || null, avatar_url || null, display_name || null, bio || null, role || 'user']
    );
    return result.rows[0];
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      if (['github_id', 'username', 'email', 'avatar_url', 'display_name', 'bio', 'role'].includes(key)) {
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
};

module.exports = User;
