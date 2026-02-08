/**
 * Review Model
 * CRUD operations for the reviews table.
 */

const db = require('../database/connection');

const Review = {
  table: 'reviews',

  columns: `
    id, pull_request_id, reviewer_id, status, score, summary,
    total_issues, raw_output, started_at, completed_at, created_at, updated_at
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
    const { pull_request_id, reviewer_id, status, score, summary, total_issues, raw_output } = data;
    const result = await db.query(
      `INSERT INTO ${this.table}
        (pull_request_id, reviewer_id, status, score, summary, total_issues, raw_output)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${this.columns}`,
      [pull_request_id, reviewer_id || null, status || 'pending', score || null, summary || null, total_issues || 0, raw_output || null]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      if (['status', 'score', 'summary', 'total_issues', 'raw_output', 'started_at', 'completed_at'].includes(key)) {
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

  async findAllForUser(userId, { page = 1, perPage = 20, search = '', sort = 'completed_at', order = 'desc' } = {}) {
    const conditions = ['r.reviewer_id = $1', "r.status = 'completed'"];
    const params = [userId];
    let idx = 2;

    if (search) {
      conditions.push(`(rp.full_name ILIKE $${idx} OR p.pr_number::text ILIKE $${idx} OR r.summary ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const allowedSort = { completed_at: 'r.completed_at', score: 'r.score', created_at: 'r.created_at' };
    const sortCol = allowedSort[sort] || 'r.completed_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    const where = conditions.join(' AND ');
    const offset = (page - 1) * perPage;

    const countResult = await db.query(
      `SELECT COUNT(*)::int AS count
       FROM ${this.table} r
       LEFT JOIN pull_requests p ON r.pull_request_id = p.id
       LEFT JOIN repositories rp ON p.repository_id = rp.id
       WHERE ${where}`,
      params
    );

    const dataResult = await db.query(
      `SELECT r.id, r.score, r.summary, r.total_issues, r.completed_at, r.created_at,
              rp.full_name AS repo_full_name, rp.name AS repo_name,
              p.pr_number, p.title AS pr_title
       FROM ${this.table} r
       LEFT JOIN pull_requests p ON r.pull_request_id = p.id
       LEFT JOIN repositories rp ON p.repository_id = rp.id
       WHERE ${where}
       ORDER BY ${sortCol} ${sortOrder} NULLS LAST
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, perPage, offset]
    );

    return { rows: dataResult.rows, total: countResult.rows[0].count };
  },

  async findByIdWithDetails(id) {
    const result = await db.query(
      `SELECT r.id, r.score, r.summary, r.total_issues, r.raw_output,
              r.completed_at, r.created_at, r.status,
              rp.full_name AS repo_full_name, rp.name AS repo_name,
              rp.owner_name AS repo_owner, rp.url AS repo_url,
              p.pr_number, p.title AS pr_title, p.state AS pr_state,
              p.head_branch, p.base_branch
       FROM ${this.table} r
       LEFT JOIN pull_requests p ON r.pull_request_id = p.id
       LEFT JOIN repositories rp ON p.repository_id = rp.id
       WHERE r.id = $1`,
      [id]
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

  async dashboard(userId) {
    const result = await db.query(
      `SELECT ${this.columns} FROM ${this.table}
       WHERE reviewer_id = $1 AND status = 'completed'
       ORDER BY completed_at DESC NULLS LAST, created_at DESC`,
      [userId]
    );

    const data = result.rows.map((r) => {
      let categories = { bugs: [], security: [], performance: [], readability: [], maintainability: [], codeSmells: [] };
      try {
        if (r.raw_output) {
          const parsed = typeof r.raw_output === 'string' ? JSON.parse(r.raw_output) : r.raw_output;
          categories = {
            bugs: parsed.bugs || [],
            security: parsed.security || [],
            performance: parsed.performance || [],
            readability: parsed.readability || [],
            maintainability: parsed.maintainability || [],
            codeSmells: parsed.codeSmells || [],
          };
        }
      } catch {
        // raw_output may be malformed
      }

      return {
        id: r.id,
        score: r.score,
        summary: r.summary,
        totalIssues: r.total_issues,
        completedAt: r.completed_at,
        createdAt: r.created_at,
        categories,
        categoryCounts: {
          bugs: categories.bugs.length,
          security: categories.security.length,
          performance: categories.performance.length,
          readability: categories.readability.length,
          maintainability: categories.maintainability.length,
          codeSmells: categories.codeSmells.length,
        },
      };
    });

    const totalReviews = data.length;
    const totalIssues = data.reduce((s, r) => s + r.totalIssues, 0);
    const avgScore = totalReviews > 0
      ? Math.round(data.reduce((s, r) => s + (r.score || 0), 0) / totalReviews)
      : 0;

    return { reviews: data, stats: { totalReviews, totalIssues, averageScore: avgScore } };
  },
};

module.exports = Review;
