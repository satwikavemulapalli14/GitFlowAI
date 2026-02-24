const db = require('../database/connection');

const Search = {
  async global(userId, { query = '', type = 'all', repositoryId = '', dateFrom = '', dateTo = '', scoreMin = '', scoreMax = '', status = '', page = 1, perPage = 20 } = {}) {
    const params = [];
    let idx = 2;

    const repoClauses = [];
    const prClauses = [];
    const reviewClauses = [];

    if (query) {
      repoClauses.push(`(rp.name ILIKE $${idx} OR rp.full_name ILIKE $${idx} OR rp.description ILIKE $${idx})`);
      prClauses.push(`(p.title ILIKE $${idx} OR p.description ILIKE $${idx} OR p.pr_number::text ILIKE $${idx})`);
      reviewClauses.push(`(r.summary ILIKE $${idx} OR p.title ILIKE $${idx})`);
      params.push(`%${query}%`);
      idx++;
    }

    if (repositoryId) {
      const c = `rp.id = $${idx}`;
      repoClauses.push(c);
      prClauses.push(c);
      reviewClauses.push(c);
      params.push(repositoryId);
      idx++;
    }

    if (dateFrom) {
      reviewClauses.push(`r.created_at >= $${idx}`);
      params.push(dateFrom);
      idx++;
    }

    if (dateTo) {
      reviewClauses.push(`r.created_at <= $${idx}`);
      params.push(dateTo);
      idx++;
    }

    if (scoreMin != null && scoreMin !== '') {
      reviewClauses.push(`r.score >= $${idx}`);
      params.push(parseInt(scoreMin, 10));
      idx++;
    }

    if (scoreMax != null && scoreMax !== '') {
      reviewClauses.push(`r.score <= $${idx}`);
      params.push(parseInt(scoreMax, 10));
      idx++;
    }

    if (status) {
      if (status === 'open' || status === 'closed' || status === 'merged') {
        prClauses.push(`p.state = $${idx}`);
      } else {
        reviewClauses.push(`r.status = $${idx}`);
      }
      params.push(status);
      idx++;
    }

    const rpWhere = repoClauses.length > 0 ? ` AND ${repoClauses.join(' AND ')}` : '';
    const pWhere = prClauses.length > 0 ? ` AND ${prClauses.join(' AND ')}` : '';
    const rWhere = reviewClauses.length > 0 ? ` AND ${reviewClauses.join(' AND ')}` : '';

    const repositorySelect = `
      SELECT 'repository' AS type, rp.id, rp.name AS title, rp.description,
             rp.full_name AS repo_full_name, NULL::int AS pr_number, NULL AS pr_title,
             NULL::int AS score, NULL AS status, rp.created_at,
             rp.language, rp.stars, rp.url, rp.owner_name AS repo_owner
      FROM repositories rp
      WHERE rp.owner_id = $1${rpWhere}
    `;

    const pullRequestSelect = `
      SELECT 'pull_request' AS type, p.id, p.title, p.description,
             rp.full_name AS repo_full_name, p.pr_number, NULL AS pr_title,
             NULL::int AS score, p.state AS status, p.created_at,
             NULL AS language, NULL::int AS stars, NULL AS url, rp.owner_name AS repo_owner
      FROM pull_requests p
      JOIN repositories rp ON p.repository_id = rp.id
      WHERE rp.owner_id = $1${pWhere}
    `;

    const reviewSelect = `
      SELECT 'review' AS type, r.id, COALESCE(p.title, '') AS title, r.summary AS description,
             rp.full_name AS repo_full_name, p.pr_number, p.title AS pr_title,
             r.score, r.status, r.completed_at,
             NULL AS language, NULL::int AS stars, NULL AS url, rp.owner_name AS repo_owner
      FROM reviews r
      JOIN pull_requests p ON r.pull_request_id = p.id
      JOIN repositories rp ON p.repository_id = rp.id
      WHERE r.reviewer_id = $1${rWhere}
    `;

    let unionParts = [];
    if (type === 'all' || type === 'repositories') unionParts.push(repositorySelect);
    if (type === 'all' || type === 'pull_requests') unionParts.push(pullRequestSelect);
    if (type === 'all' || type === 'reviews') unionParts.push(reviewSelect);

    const allParams = [userId, ...params];
    const paramIdx = allParams.length + 1;

    const unionSql = unionParts.join(' UNION ALL ');

    const countSql = `SELECT COUNT(*)::int AS count FROM (${unionSql}) AS combined`;
    const countResult = await db.query(countSql, allParams);
    const total = countResult.rows[0].count;

    const offset = (page - 1) * perPage;
    const dataSql = `
      SELECT * FROM (${unionSql}) AS combined
      ORDER BY created_at DESC NULLS LAST
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;
    const dataResult = await db.query(dataSql, [...allParams, perPage, offset]);

    let summary = {};
    if (type === 'all') {
      const [repoCount, prCount, revCount] = await Promise.all([
        db.query(`SELECT COUNT(*)::int AS count FROM (${repositorySelect}) AS r`, allParams),
        db.query(`SELECT COUNT(*)::int AS count FROM (${pullRequestSelect}) AS p`, allParams),
        db.query(`SELECT COUNT(*)::int AS count FROM (${reviewSelect}) AS r`, allParams),
      ]);
      summary = {
        all: total,
        repositories: repoCount.rows[0].count,
        pullRequests: prCount.rows[0].count,
        reviews: revCount.rows[0].count,
      };
    } else {
      summary = { all: total, repositories: 0, pullRequests: 0, reviews: 0 };
      summary[type] = total;
    }

    return { rows: dataResult.rows, total, summary };
  },

  async repositories(userId) {
    const result = await db.query(
      `SELECT id, full_name AS name FROM repositories WHERE owner_id = $1 ORDER BY full_name`,
      [userId]
    );
    return result.rows;
  },
};

module.exports = Search;
