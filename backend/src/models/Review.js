/**
 * Review Model
 * CRUD operations for the reviews table.
 */

const db = require('../database/connection');

const Review = {
  table: 'reviews',

  columns: `
    id, pull_request_id, reviewer_id, status, score, summary,
    total_issues, started_at, completed_at, created_at, updated_at
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

  async findByPullRequest(pullRequestId) {
    const result = await db.query(
      `SELECT ${this.columns} FROM ${this.table} WHERE pull_request_id = $1 ORDER BY created_at DESC`,
      [pullRequestId]
    );
    return result.rows;
  },

  async findByReviewer(reviewerId) {
    const result = await db.query(
      `SELECT ${this.columns} FROM ${this.table} WHERE reviewer_id = $1 ORDER BY created_at DESC`,
      [reviewerId]
    );
    return result.rows;
  },

  async findByStatus(status) {
    const result = await db.query(
      `SELECT ${this.columns} FROM ${this.table} WHERE status = $1 ORDER BY created_at DESC`,
      [status]
    );
    return result.rows;
  },

  async create(data) {
    const { pull_request_id, reviewer_id, status, score, summary, total_issues } = data;
    const result = await db.query(
      `INSERT INTO ${this.table}
        (pull_request_id, reviewer_id, status, score, summary, total_issues)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${this.columns}`,
      [pull_request_id, reviewer_id || null, status || 'pending', score || null, summary || null, total_issues || 0]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      if (['status', 'score', 'summary', 'total_issues', 'started_at', 'completed_at'].includes(key)) {
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

  async averageScore() {
    const result = await db.query(
      `SELECT COALESCE(AVG(score)::int, 0) AS average FROM ${this.table} WHERE score IS NOT NULL`
    );
    return result.rows[0].average;
  },
};

module.exports = Review;
