import pool from '../../core/config/database';

export class GoalRepository {
  async create(userId: number, data: any) {
    const { category_key, target_amount, period, start_date, description } = data;
    const result = await pool.query(
      `INSERT INTO goals (user_id, category_key, target_amount, period, start_date, description)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, category_key, target_amount, period, start_date, description || null]
    );
    return result.rows[0];
  }

  async findAll(userId: number) {
    const result = await pool.query(
      `SELECT * FROM goals WHERE user_id = $1 ORDER BY start_date DESC`,
      [userId]
    );
    return result.rows;
  }

  async findById(userId: number, id: string) {
    const result = await pool.query(
      `SELECT * FROM goals WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return result.rows[0];
  }

  async update(userId: number, id: string, data: any) {
    const { category_key, target_amount, period, start_date, description } = data;
    const result = await pool.query(
      `UPDATE goals SET category_key = $1, target_amount = $2, period = $3, start_date = $4, description = $5
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [category_key, target_amount, period, start_date, description || null, id, userId]
    );
    return result.rows[0];
  }

  async delete(userId: number, id: string) {
    const result = await pool.query(
      `DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );
    return result.rows[0];
  }
}