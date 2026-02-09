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

  async analytics(userId) {
    const result = await db.query(
      `SELECT r.score, r.total_issues, r.completed_at, r.raw_output,
              rp.full_name AS repo_full_name
       FROM ${this.table} r
       LEFT JOIN pull_requests p ON r.pull_request_id = p.id
       LEFT JOIN repositories rp ON p.repository_id = rp.id
       WHERE r.reviewer_id = $1 AND r.status = 'completed'
       ORDER BY r.completed_at ASC NULLS LAST`,
      [userId]
    );

    const rows = result.rows;
    if (rows.length === 0) {
      return {
        averageScore: 0,
        scoreTrend: [],
        issuesByCategory: { bugs: 0, security: 0, performance: 0, readability: 0, maintainability: 0, codeSmells: 0 },
        repositoriesReviewed: [],
        monthlyReviews: [],
        commonCodeSmells: [],
      };
    }

    const scores = rows.map((r) => r.score).filter(Boolean);
    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    const scoreByMonth = {};
    const reviewsByMonth = {};
    for (const r of rows) {
      if (!r.completed_at) continue;
      const month = new Date(r.completed_at).toISOString().slice(0, 7);
      if (!scoreByMonth[month]) { scoreByMonth[month] = []; reviewsByMonth[month] = 0; }
      if (r.score) scoreByMonth[month].push(r.score);
      reviewsByMonth[month]++;
    }
    const scoreTrend = Object.entries(scoreByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, vals]) => ({
        month,
        averageScore: vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0,
        count: reviewsByMonth[month] || 0,
      }));

    const issuesByCategory = { bugs: 0, security: 0, performance: 0, readability: 0, maintainability: 0, codeSmells: 0 };
    const smellMessages = [];

    for (const r of rows) {
      if (!r.raw_output) continue;
      let parsed;
      try {
        parsed = typeof r.raw_output === 'string' ? JSON.parse(r.raw_output) : r.raw_output;
      } catch {
        continue;
      }
      for (const cat of Object.keys(issuesByCategory)) {
        const items = parsed[cat];
        if (Array.isArray(items)) {
          issuesByCategory[cat] += items.length;
          if (cat === 'codeSmells') {
            for (const item of items) {
              smellMessages.push(item.message || item.problem || '');
            }
          }
        }
      }
    }

    const smellCount = {};
    for (const msg of smellMessages) {
      const key = msg.trim().toLowerCase();
      if (!key) continue;
      smellCount[key] = (smellCount[key] || 0) + 1;
    }
    const commonCodeSmells = Object.entries(smellCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([message, count]) => ({ message, count }));

    const repoCount = {};
    for (const r of rows) {
      const name = r.repo_full_name;
      if (!name) continue;
      repoCount[name] = (repoCount[name] || 0) + 1;
    }
    const repositoriesReviewed = Object.entries(repoCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const monthlyReviews = Object.entries(reviewsByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));

    return {
      averageScore,
      scoreTrend,
      issuesByCategory,
      repositoriesReviewed,
      monthlyReviews,
      commonCodeSmells,
    };
  },
};

module.exports = Review;
