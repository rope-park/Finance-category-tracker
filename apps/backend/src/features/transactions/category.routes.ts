/**
 * 카테고리 관리 API 라우트
 * 
 * 거래 내역의 카테고리 분석 및 관리 기능.
 * 수입과 지출을 체계적으로 분류하여 통계와 분석에 활용.
 * 
 * 주요 기능:
 * - 전체 카테고리 목록 조회
 * - 수입/지출 별 필터링
 * - 카테고리 사용 통계
 * - 자동 분류 기능 지원
 * 
 * @author Ju Eul Park (rope-park)
 */

const express = require('express');
import pool from '../../core/config/database';
import { authenticateToken } from '../../shared/middleware/auth';

const router = express.Router();

// ==================================================
// 카테고리 조회 엔드포인트
// ==================================================

/**
 * GET api/transactions/categories
 * 모든 카테고리 조회
 * 
 * 수입과 지출 카테고리를 선택적으로 필터링하여 조회.
 * 알파벳 순서로 정렬되어 사용자 경험 향상.
 * 
 * 쿼리 파라미터:
 * - type: 'income' | 'expense' (선택) - 카테고리 유형 필터
 * @return {Object} 카테고리 목록
 */
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;

    // 기본 쿼리 작성
    let query = 'SELECT * FROM categories';
    const queryParams: any[] = [];
    
    // 타입별 필터링 (수입/지출)
    if (type && (type === 'income' || type === 'expense')) {
      query += ' WHERE type = $1';
      queryParams.push(type);
    }
    
    // 알파벳 순서 정렬
    query += ' ORDER BY name ASC';

    const result = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: {
        categories: result.rows
      }
    });

  } catch (error) {
    console.error('❌ 카테고리 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '카테고리를 조회하는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/transactions/categories/recommend
 * 카테고리 추천
 * 
 * 사용자 연령대와 직업군 기반 적합한 카테고리 추천.
 * 
 * 쿼리 파라미터:
 * - age_group: 연령대 (필수) - '20s', '30s', '40s' 등
 * - job_group: 직업군 (선택) - 'student', 'office', 'freelance' 등
 * @return {Object} 카테고리 목록
 */
router.get('/recommend', async (req, res) => {
  try {
    const { age_group, job_group } = req.query;
    
    // 연령대 파라미터 필수 검증
    if (!age_group) {
      return res.status(400).json({
        success: false,
        error: 'age_group 파라미터가 필요합니다.'
      });
    }

    // 간단한 추천 로직 (실제로는 ML 기반 개인화 추천 시스템 적용 가능)
    const recommendedCategories = ['food', 'leisure', 'education', 'shopping'];
    
    res.json({
      success: true,
      data: {
        recommended_categories: recommendedCategories
      }
    });

  } catch (error) {
    console.error('❌ 카테고리 추천 오류:', error);
    res.status(500).json({
      success: false,
      error: '카테고리 추천 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/transactions/categories/:categoryKey
 * 특정 카테고리 상세 정보 조회 API
 * 
 * 카테고리의 기본 정보와 메타데이터 제공.
 *
 * 경로 파라미터:
 * - categoryKey: 조회할 카테고리의 고유 ID
 * @return {Object} 카테고리 상세 정보
 */
router.get('/:categoryKey', async (req, res) => {
  try {
    const { categoryKey } = req.params;

    // 카테고리 ID로 데이터베이스에서 카테고리 정보 조회
    const result = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [categoryKey]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '카테고리를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: {
        category: result.rows[0]
      }
    });

  } catch (error) {
    console.error('❌ 카테고리 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '카테고리를 조회하는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/transactions/categories/usage/stats
 * 사용자별 카테고리 사용 통계
 * 
 * 특정 사용자의 카테고리별 거래 통계 조회.
 * 
 * 쿼리 파라미터:
 * - startDate: 시작 날짜 (선택)
 * - endDate: 종료 날짜 (선택)
 * - type: 카테고리 유형 필터 ('income' | 'expense')
 * @return {Object} 카테고리 사용 통계
 */
router.get('/usage/stats', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { startDate, endDate, type } = req.query;

    // 카테고리와 거래 데이터를 조인하여 통계 계산하는 쿼리
    let query = `
      SELECT 
        c.category_key,
        c.name,
        c.icon,
        c.color,
        c.type,
        COUNT(t.id) as usage_count,
        COALESCE(SUM(t.amount), 0) as total_amount,
        COALESCE(AVG(t.amount), 0) as avg_amount
      FROM categories c
      LEFT JOIN transactions t ON c.category_key = t.category_key AND t.user_id = $1
    `;

    const queryParams: any[] = [userId];
    let paramCount = 1;

    // 날짜 범위 필터 동적 추가
    if (startDate) {
      paramCount++;
      query += ` AND t.transaction_date >= $${paramCount}`;  // 시작 날짜 이후 거래만 포함
      queryParams.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND t.transaction_date <= $${paramCount}`;  // 종료 날짜 이전 거래만 포함
      queryParams.push(endDate);
    }

    // 수입/지출 카테고리 타입 필터 선택적 적용
    if (type && (type === 'income' || type === 'expense')) {
      query += ` WHERE c.type = $${paramCount + 1}`;  // 지정된 타입의 카테고리만 포함
      queryParams.push(type);
    }

    query += `
      GROUP BY c.category_key, c.name, c.icon, c.color, c.type, c.display_order
      ORDER BY usage_count DESC, total_amount DESC, c.display_order ASC
    `;
    // 그룹화: 카테고리별로 통계 데이터 집계
    // 정렬: 1) 사용 횟수 내림차순 2) 총 금액 내림차순 3) 표시 순서 오름차순

    const result = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: {
        categoryStats: result.rows.map(row => ({
          ...row,
          usage_count: parseInt(row.usage_count),      // 문자열로 반환된 수치를 정수로 변환
          total_amount: parseFloat(row.total_amount),  // 문자열로 반환된 금액을 실수로 변환
          avg_amount: parseFloat(row.avg_amount)       // 문자열로 반환된 평균값을 실수로 변환
        }))
      }
    });

  } catch (error) {
    console.error('❌ 카테고리 사용 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '카테고리 사용 통계를 조회하는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/transactions/categories/:categoryKey/monthly-stats
 * 특정 카테고리의 월별 통계 조회
 * 
 * 선택한 카테고리의 월별 사용 패턴과 지출 변화 분석.
 * 
 * 경로 파라미터:
 * - categoryKey: 분석할 카테고리의 고유 ID
 * 
 * 쿼리 파라미터:
 * - year: 분석할 연도 (선택, 미지정시 전체 기간)
 * 
 * @return {Object} 카테고리 월별 통계
 */
router.get('/:categoryKey/monthly-stats', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { categoryKey } = req.params;
    const { year } = req.query;

    // 먼저 해당 카테고리가 존재하는지 확인
    const categoryResult = await pool.query(
      'SELECT * FROM categories WHERE category_key = $1',
      [categoryKey]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '카테고리를 찾을 수 없습니다.'
      });
    }

    // 연도별 필터링을 위한 동적 조건 생성
    let dateFilter = '';
    const queryParams: any[] = [userId, categoryKey];
    
    if (year) {
      dateFilter = `AND EXTRACT(YEAR FROM transaction_date) = $3`;  // 지정된 연도의 데이터만 필터링
      queryParams.push(year);  // 연도 값을 쿼리 파라미터에 추가
    }

    // 월별 통계 데이터 집계 쿼리
    const query = `
      SELECT 
        EXTRACT(YEAR FROM transaction_date) as year,    -- 거래 날짜에서 연도 추출
        EXTRACT(MONTH FROM transaction_date) as month,   -- 거래 날짜에서 월 추출
        COUNT(*) as transaction_count,                   -- 해당 월의 거래 건수
        SUM(amount) as total_amount,                     -- 해당 월의 총 거래 금액
        AVG(amount) as avg_amount                        -- 해당 월의 평균 거래 금액
      FROM transactions 
      WHERE user_id = $1 AND category_key = $2 ${dateFilter}
      GROUP BY EXTRACT(YEAR FROM transaction_date), EXTRACT(MONTH FROM transaction_date)  -- 연도와 월별로 그룹화
      ORDER BY year DESC, month DESC                      -- 최신 날짜순으로 정렬
    `;

    const result = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: {
        category: categoryResult.rows[0],              // 조회된 카테고리 기본 정보
        monthlyStats: result.rows.map(row => ({
          year: parseInt(row.year),                         // 연도 정수 변환
          month: parseInt(row.month),                       // 월 정수 변환
          transaction_count: parseInt(row.transaction_count), // 거래 건수 정수 변환
          total_amount: parseFloat(row.total_amount),       // 총 금액 실수 변환
          avg_amount: parseFloat(row.avg_amount)            // 평균 금액 실수 변환
        }))
      }
    });

  } catch (error) {
    console.error('❌ 카테고리 월별 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '카테고리 월별 통계를 조회하는 중 오류가 발생했습니다.'
    });
  }
});

export default router;