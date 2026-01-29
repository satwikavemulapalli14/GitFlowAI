/**
 * PullRequest Model
 * CRUD operations for the pull_requests table.
 */

const db = require('../database/connection');

const PullRequest = {
  table: 'pull_requests',

  columns: `
    id, github_id, repository_id, title, description,
    author_id, state, head_branch, base_branch, pr_number,
    is_analyzed, created_at, updated_at
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

  async findByRepository(repositoryId) {
    const result = await db.query(
      `SELECT ${this.columns} FROM ${this.table} WHERE repository_id = $1 ORDER BY pr_number DESC`,
      [repositoryId]
    );
    return result.rows;
  },

  async findByAuthor(authorId) {
    const result = await db.query(
      `SELECT ${this.columns} FROM ${this.table} WHERE author_id = $1 ORDER BY created_at DESC`,
      [authorId]
    );
    return result.rows;
  },

  async findByState(state) {
    const result = await db.query(
      `SELECT ${this.columns} FROM ${this.table} WHERE state = $1 ORDER BY updated_at DESC`,
      [state]
    );
    return result.rows;
  },

  async findByRepoAndNumber(repositoryId, prNumber) {
    const result = await db.query(
      `SELECT ${this.columns} FROM ${this.table} WHERE repository_id = $1 AND pr_number = $2`,
      [repositoryId, prNumber]
    );
    return result.rows[0] || null;
  },

  async create(data) {
    const { github_id, repository_id, title, description, author_id, state, head_branch, base_branch, pr_number, is_analyzed } = data;
    const result = await db.query(
      `INSERT INTO ${this.table}
        (github_id, repository_id, title, description, author_id, state, head_branch, base_branch, pr_number, is_analyzed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING ${this.columns}`,
      [github_id || null, repository_id, title, description || null, author_id, state || 'open', head_branch || null, base_branch || null, pr_number, is_analyzed || false]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      if (['title', 'description', 'state', 'head_branch', 'base_branch', 'is_analyzed'].includes(key)) {
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

  async countByState(state) {
    const result = await db.query(
      `SELECT COUNT(*)::int AS count FROM ${this.table} WHERE state = $1`,
      [state]
    );
    return result.rows[0].count;
  },
};

module.exports = PullRequest;
