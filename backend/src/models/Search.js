const db = require('../database/connection');

const Search = {
  async global(userId, { query = '', type = 'all', repositoryId = '', dateFrom = '', dateTo = '', scoreMin = '', scoreMax = '', status = '', page = 1, perPage = 20 } = {}) {
    const params = [];
    let idx = 1;

    const conditions = [];

    if (query) {
      const searchClauses = [];
      searchClauses.push(`(rp.full_name ILIKE $${idx} OR rp.name ILIKE $${idx} OR rp.description ILIKE $${idx})`);
      searchClauses.push(`(p.title ILIKE $${idx} OR p.description ILIKE $${idx} OR p.pr_number::text ILIKE $${idx})`);
      searchClauses.push(`(r.summary ILIKE $${idx} OR p.title ILIKE $${idx})`);
      conditions.push(searchClauses.join('\n      OR\n      '));
      params.push(`%${query}%`);
      idx++;
    }

    if (repositoryId) {
      conditions.push(`rp.id = $${idx}`);
      params.push(repositoryId);
      idx++;
    }

    if (dateFrom) {
      conditions.push(`r.created_at >= $${idx}`);
      params.push(dateFrom);
      idx++;
    }

    if (dateTo) {
      conditions.push(`r.created_at <= $${idx}`);
      params.push(dateTo);
      idx++;
    }

    if (scoreMin) {
      conditions.push(`r.score >= $${idx}`);
      params.push(parseInt(scoreMin, 10));
      idx++;
    }

    if (scoreMax) {
      conditions.push(`r.score <= $${idx}`);
      params.push(parseInt(scoreMax, 10));
      idx++;
    }

    if (status) {
      if (status === 'open' || status === 'closed' || status === 'merged') {
        conditions.push(`p.state = $${idx}`);
      } else {
        conditions.push(`r.status = $${idx}`);
      }
      params.push(status);
      idx++;
    }

    const filterClause = conditions.length > 0 ? `AND (${conditions.join(') AND (')})` : '';

    const repositorySelect = `
      SELECT 'repository' AS type, rp.id, rp.name AS title, rp.description,
             rp.full_name AS repo_full_name, NULL::int AS pr_number, NULL AS pr_title,
             NULL::int AS score, NULL AS status, rp.created_at,
             rp.language, rp.stars, rp.url, rp.owner_name AS repo_owner
      FROM repositories rp
      WHERE rp.owner_id = $1
    `;

    const pullRequestSelect = `
      SELECT 'pull_request' AS type, p.id, p.title, p.description,
             rp.full_name AS repo_full_name, p.pr_number, NULL AS pr_title,
             NULL::int AS score, p.state AS status, p.created_at,
             NULL AS language, NULL::int AS stars, NULL AS url, rp.owner_name AS repo_owner
      FROM pull_requests p
      JOIN repositories rp ON p.repository_id = rp.id
      WHERE rp.owner_id = $1
    `;

    const reviewSelect = `
      SELECT 'review' AS type, r.id, COALESCE(p.title, '') AS title, r.summary AS description,
             rp.full_name AS repo_full_name, p.pr_number, p.title AS pr_title,
             r.score, r.status, r.completed_at,
             NULL AS language, NULL::int AS stars, NULL AS url, rp.owner_name AS repo_owner
      FROM reviews r
      JOIN pull_requests p ON r.pull_request_id = p.id
      JOIN repositories rp ON p.repository_id = rp.id
      WHERE r.reviewer_id = $1
    `;

    let unionParts = [];
    if (type === 'all' || type === 'repositories') unionParts.push(repositorySelect + filterClause);
    if (type === 'all' || type === 'pull_requests') unionParts.push(pullRequestSelect + filterClause);
    if (type === 'all' || type === 'reviews') unionParts.push(reviewSelect + filterClause);

    const allParams = [userId, ...params];
    const countIdx = allParams.length + 1;

    const countSql = `SELECT COUNT(*)::int AS count FROM (${unionParts.join(' UNION ALL ')}) AS combined`;
    const countResult = await db.query(countSql, allParams);
    const total = countResult.rows[0].count;

    const offset = (page - 1) * perPage;
    const dataSql = `
      SELECT * FROM (${unionParts.join(' UNION ALL ')}) AS combined
      ORDER BY created_at DESC NULLS LAST
      LIMIT $${countIdx} OFFSET $${countIdx + 1}
    `;
    const dataResult = await db.query(dataSql, [...allParams, perPage, offset]);

    const reposCountSql = `SELECT COUNT(*)::int AS count FROM (${repositorySelect + filterClause}) AS r`;
    const prsCountSql = `SELECT COUNT(*)::int AS count FROM (${pullRequestSelect + filterClause}) AS p`;
    const revsCountSql = `SELECT COUNT(*)::int AS count FROM (${reviewSelect + filterClause}) AS r`;

    let summary = {};
    if (type === 'all') {
      const [repoCount, prCount, revCount] = await Promise.all([
        db.query(reposCountSql, allParams),
        db.query(prsCountSql, allParams),
        db.query(revsCountSql, allParams),
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
