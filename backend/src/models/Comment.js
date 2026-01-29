/**
 * Comment Model
 * CRUD operations for the comments table.
 */

const db = require('../database/connection');

const Comment = {
  table: 'comments',

  columns: `
    id, review_id, file_path, line_number, severity,
    category, message, suggestion, is_resolved, created_at, updated_at
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

  async findByReview(reviewId) {
    const result = await db.query(
      `SELECT ${this.columns} FROM ${this.table} WHERE review_id = $1 ORDER BY file_path, line_number`,
      [reviewId]
    );
    return result.rows;
  },

  async findBySeverity(severity) {
    const result = await db.query(
      `SELECT ${this.columns} FROM ${this.table} WHERE severity = $1 ORDER BY created_at DESC`,
      [severity]
    );
    return result.rows;
  },

  async findByFile(reviewId, filePath) {
    const result = await db.query(
      `SELECT ${this.columns} FROM ${this.table} WHERE review_id = $1 AND file_path = $2 ORDER BY line_number`,
      [reviewId, filePath]
    );
    return result.rows;
  },

  async create(data) {
    const { review_id, file_path, line_number, severity, category, message, suggestion } = data;
    const result = await db.query(
      `INSERT INTO ${this.table}
        (review_id, file_path, line_number, severity, category, message, suggestion)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${this.columns}`,
      [review_id, file_path || null, line_number || null, severity || 'info', category || null, message, suggestion || null]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      if (['message', 'suggestion', 'severity', 'category', 'is_resolved', 'file_path', 'line_number'].includes(key)) {
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

  async countBySeverity(severity) {
    const result = await db.query(
      `SELECT COUNT(*)::int AS count FROM ${this.table} WHERE severity = $1`,
      [severity]
    );
    return result.rows[0].count;
  },
};

module.exports = Comment;
