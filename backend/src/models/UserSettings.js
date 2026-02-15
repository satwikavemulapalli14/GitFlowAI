const db = require('../database/connection');

const UserSettings = {
  table: 'user_settings',

  columns: `
    id, user_id, dark_mode, email_notifications, slack_integration,
    review_reminders, openai_api_key, created_at, updated_at
  `,

  async findByUserId(userId) {
    const result = await db.query(
      `SELECT ${this.columns} FROM ${this.table} WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  },

  async upsert(userId, data) {
    const existing = await this.findByUserId(userId);

    if (existing) {
      const fields = [];
      const values = [];
      let idx = 1;

      for (const [key, value] of Object.entries(data)) {
        if (['dark_mode', 'email_notifications', 'slack_integration', 'review_reminders', 'openai_api_key'].includes(key)) {
          fields.push(`${key} = $${idx++}`);
          values.push(value);
        }
      }

      if (fields.length === 0) return existing;

      values.push(userId);
      const result = await db.query(
        `UPDATE ${this.table} SET ${fields.join(', ')} WHERE user_id = $${idx}
         RETURNING ${this.columns}`,
        values
      );
      return result.rows[0] || null;
    }

    const result = await db.query(
      `INSERT INTO ${this.table}
        (user_id, dark_mode, email_notifications, slack_integration, review_reminders, openai_api_key)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${this.columns}`,
      [
        userId,
        data.dark_mode ?? false,
        data.email_notifications ?? true,
        data.slack_integration ?? false,
        data.review_reminders ?? 'daily',
        data.openai_api_key || null,
      ]
    );
    return result.rows[0];
  },
};

module.exports = UserSettings;
