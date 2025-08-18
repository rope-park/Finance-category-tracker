import express from 'express';
import pool from '../config/database';
import { ApiResponse } from '../types';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 모든 카테고리 조회 (인증 필요)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { transaction_type, primary_category } = req.query;

    let query = 'SELECT * FROM categories WHERE 1=1';
    const values: string[] = [];
    let paramCounter = 1;

    if (transaction_type) {
      query += ` AND transaction_type = $${paramCounter++}`;
      values.push(transaction_type as string);
    }

    if (primary_category) {
      query += ` AND primary_category = $${paramCounter++}`;
      values.push(primary_category as string);
    }

    query += ' ORDER BY transaction_type, primary_category, secondary_category';

    const result = await pool.query(query, values);

    const response: ApiResponse = {
      success: true,
      data: { categories: result.rows },
      message: '카테고리 목록을 조회했습니다.'
    };

    res.json(response);
  } catch (error) {
    console.error('카테고리 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
});

// 주요 카테고리별 그룹화된 카테고리 조회
router.get('/grouped', authenticateToken, async (req, res) => {
  try {
    const { transaction_type } = req.query;

    let query = `
      SELECT 
        transaction_type,
        primary_category,
        json_agg(
          json_build_object(
            'id', id,
            'category_key', category_key,
            'secondary_category', secondary_category,
            'icon', icon,
            'label_ko', label_ko,
            'color', color
          ) ORDER BY secondary_category
        ) as categories
      FROM categories
    `;

    const values: string[] = [];
    let paramCounter = 1;

    if (transaction_type) {
      query += ` WHERE transaction_type = $${paramCounter++}`;
      values.push(transaction_type as string);
    }

    query += ` GROUP BY transaction_type, primary_category ORDER BY transaction_type, primary_category`;

    const result = await pool.query(query, values);

    const response: ApiResponse = {
      success: true,
      data: { groupedCategories: result.rows },
      message: '그룹화된 카테고리 목록을 조회했습니다.'
    };

    res.json(response);
  } catch (error) {
    console.error('그룹화된 카테고리 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
});

// 단일 카테고리 조회
router.get('/:categoryKey', authenticateToken, async (req, res) => {
  try {
    const { categoryKey } = req.params;

    const result = await pool.query(
      'SELECT * FROM categories WHERE category_key = $1',
      [categoryKey]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '카테고리를 찾을 수 없습니다.'
      });
    }

    const response: ApiResponse = {
      success: true,
      data: { category: result.rows[0] },
      message: '카테고리를 조회했습니다.'
    };

    res.json(response);
  } catch (error) {
    console.error('카테고리 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
});

export default router;
