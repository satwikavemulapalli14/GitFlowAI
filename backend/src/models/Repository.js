const db = require('../database/connection');

const Repository = {
  table: 'repositories',

  columns: `
    id, github_id, name, full_name, description, url,
    default_branch, owner_id, language, stars, forks,
    open_issues, visibility, owner_name, owner_avatar_url,
    is_active, last_github_update, created_at, updated_at
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

  async findByOwner(ownerId, { page = 1, perPage = 20, search = '', language = '' } = {}) {
    const conditions = ['owner_id = $1'];
    const params = [ownerId];
    let idx = 2;

    if (search) {
      conditions.push(`(name ILIKE $${idx} OR full_name ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    if (language) {
      conditions.push(`language = $${idx}`);
      params.push(language);
      idx++;
    }

    const where = conditions.join(' AND ');
    const offset = (page - 1) * perPage;

    const countResult = await db.query(
      `SELECT COUNT(*)::int AS count FROM ${this.table} WHERE ${where}`,
      params
    );

    const dataResult = await db.query(
      `SELECT ${this.columns} FROM ${this.table}
       WHERE ${where}
       ORDER BY stars DESC, updated_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, perPage, offset]
    );

    return { rows: dataResult.rows, total: countResult.rows[0].count };
  },

  async findByFullName(fullName) {
    const result = await db.query(
      `SELECT ${this.columns} FROM ${this.table} WHERE full_name = $1`,
      [fullName]
    );
    return result.rows[0] || null;
  },

  async findDistinctLanguages(ownerId) {
    const result = await db.query(
      `SELECT DISTINCT language FROM ${this.table}
       WHERE owner_id = $1 AND language IS NOT NULL AND language != ''
       ORDER BY language`,
      [ownerId]
    );
    return result.rows.map((r) => r.language);
  },

  async create(data) {
    const {
      github_id, name, full_name, description, url, default_branch,
      owner_id, language, stars, forks, open_issues, visibility,
      owner_name, owner_avatar_url, is_active,
    } = data;
    const result = await db.query(
      `INSERT INTO ${this.table}
        (github_id, name, full_name, description, url, default_branch,
         owner_id, language, stars, forks, open_issues, visibility,
         owner_name, owner_avatar_url, is_active, last_github_update)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
       RETURNING ${this.columns}`,
      [
        github_id || null, name, full_name, description || null,
        url || null, default_branch || 'main', owner_id,
        language || null, stars || 0, forks || 0, open_issues || 0,
        visibility || 'public', owner_name || null, owner_avatar_url || null,
        is_active !== false,
      ]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    const allowed = [
      'name', 'full_name', 'description', 'url', 'default_branch',
      'language', 'stars', 'forks', 'open_issues', 'visibility',
      'owner_name', 'owner_avatar_url', 'is_active',
    ];

    for (const [key, value] of Object.entries(data)) {
      if (allowed.includes(key)) {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await db.query(
      `UPDATE ${this.table} SET ${fields.join(', ')}, last_github_update = NOW()
       WHERE id = $${idx} RETURNING ${this.columns}`,
      values
    );
    return result.rows[0] || null;
  },

  async upsert(githubId, data) {
    const existing = await this.findByGithubId(githubId);
    if (existing) {
      return this.update(existing.id, data);
    }
    return this.create(data);
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
