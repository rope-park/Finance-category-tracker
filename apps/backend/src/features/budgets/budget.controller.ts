/**
 * 예산 관리 컨트롤러
 * 
 * 사용자의 예산 설정, 조회, 수정, 삭제 등 예산과 관련된 모든 API 요청 처리 컨트롤러.
 * 카테고리별 예산 설정, 예산 진행률 추적, 예산 초과 알림 등의 기능 제공.
 * 
 * 주요 기능:
 * - 예산 CRUD 작업 (생성, 조회, 수정, 삭제)
 * - 예산 진행률 및 사용 현황 모니터링
 * - 월별/카테고리별 예산 요약 정보 제공
 * - 예산 초과 알림 및 경고 시스템
 * 
 * API 엔드포인트:
 * - POST /api/budgets - 새 예산 생성
 * - GET /api/budgets - 예산 목록 조회
 * - GET /api/budgets/:id - 특정 예산 상세 조회
 * - PUT /api/budgets/:id - 예산 정보 수정
 * - DELETE /api/budgets/:id - 예산 삭제
 * - GET /api/budgets/summary - 예산 요약 정보 조회
 * 
 * 보안:
 * - JWT 토큰 기반 사용자 인증
 * - 사용자별 예산 데이터 접근 제어
 * - 입력 데이터 유효성 검사 및 SQL 인젝션 방지
 * 
 * @author Ju Eul Park (rope-park)
 */
import { Response } from 'express';
import pool from '../../core/config/database';
import { 
  CreateBudgetRequest, 
  UpdateBudgetRequest,
  ApiResponse,
  Budget,
  BudgetSummary
} from '@finance-tracker/shared';
import type { BudgetRecord } from './budget.repository';
import { AuthRequest } from '../../shared/middleware/auth';
import { BudgetRepository } from './budget.repository';

// 예산 데이터 접근을 위한 리포지토리 인스턴스
const budgetRepository = new BudgetRepository();

/**
 * 새로운 예산 생성 컨트롤러 함수
 * 
 * 사용자가 특정 카테고리에 대한 예산을 설정할 수 있도록 지원.
 * 예산 기간, 금액, 카테고리 등의 정보를 받아 데이터베이스에 저장.
 * 
 * @param req - 인증된 사용자 요청 객체 (예산 생성 데이터 포함)
 * @param res - HTTP 응답 객체
 * @returns 생성된 예산 정보 또는 오류 메시지
 */
export const createBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { category_key, amount, period_start, period_end }: CreateBudgetRequest = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    // 필수 필드 검증
    if (!category_key || !amount || !period_start || !period_end) {
      return res.status(400).json({
        success: false,
        error: '카테고리, 금액, 시작일, 종료일은 필수입니다.'
      });
    }

    // 카테고리 존재 여부 확인 (지출 카테고리만)
    const categoryCheck = await pool.query(
      'SELECT id FROM categories WHERE category_key = $1 AND transaction_type = $2',
      [category_key, 'expense']
    );

    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 지출 카테고리입니다.'
      });
    }

    const startDate = new Date(period_start);
    const endDate = new Date(period_end);

    // Repository를 사용하여 중복 예산 확인
    const overlappingBudgets = await budgetRepository.findOverlappingBudgets(
      userId,
      category_key,
      startDate,
      endDate
    );

    if (overlappingBudgets.length > 0) {
      return res.status(409).json({
        success: false,
        error: '해당 기간에 이미 예산이 설정되어 있습니다.'
      });
    }

    // Repository를 사용하여 예산 생성
    const budgetData = {
      user_id: userId,
      category_key,
      amount: parseFloat(amount.toString()),
      period_type: 'monthly' as const, // 기본값
      start_date: startDate,
      end_date: endDate
    };

    const budget = await budgetRepository.createBudget(budgetData);

    const response: ApiResponse = {
      success: true,
      data: { budget },
      message: '예산이 설정되었습니다.',
      timestamp: new Date().toISOString()
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('예산 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

/**
 * 예산 목록 조회 컨트롤러 함수
 * 
 * 사용자의 예산 정보를 필터링하여 목록 형태로 반환.
 * 다양한 조건(카테고리, 기간, 활성 상태 등)을 기반으로 예산을 조회.
 * 
 * @param req - 인증된 사용자 요청 객체 (필터 쿼리 함)
 * @param res - HTTP 응답 객체
 * @returns 예산 목록
 */
export const getBudgets = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { period_start, period_end, category_key, is_active = 'true' } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    // Repository 필터 구성
    const filters: any = {
      user_id: userId
    };

    if (category_key) filters.category_key = category_key as string;
    if (is_active !== undefined) filters.is_active = is_active === 'true';
    if (period_start) filters.start_date_from = new Date(period_start as string);
    if (period_end) filters.start_date_to = new Date(period_end as string);

    // Repository를 사용하여 예산 조회
  const { budgets } = await budgetRepository.findManyBudgets(filters);

    // 카테고리 정보 추가

    type EnhancedBudget = BudgetRecord & {
      category_name: string;
      primary_category?: string;
      secondary_category?: string;
      icon?: string;
      color?: string;
    };

    let enhancedBudgets: EnhancedBudget[] = budgets.map(budget => ({
      ...budget,
      category_name: budget.category_key,
    }));
    if (budgets.length > 0) {
      const categoryKeys = Array.from(new Set(budgets.map(b => b.category_key)));
      const categoryResult = await pool.query(
        'SELECT category_key, label_ko as category_name, primary_category, secondary_category, icon, color FROM categories WHERE category_key = ANY($1)',
        [categoryKeys]
      );

      const categoryMap = new Map(
        categoryResult.rows.map(cat => [cat.category_key, cat])
      );

      enhancedBudgets = budgets.map(budget => ({
        ...budget,
        category_name: categoryMap.get(budget.category_key)?.category_name || budget.category_key,
        primary_category: categoryMap.get(budget.category_key)?.primary_category,
        secondary_category: categoryMap.get(budget.category_key)?.secondary_category,
        icon: categoryMap.get(budget.category_key)?.icon,
        color: categoryMap.get(budget.category_key)?.color
      }));
    }

    const response: ApiResponse = {
      success: true,
      data: { budgets: enhancedBudgets },
      message: '예산 목록을 조회했습니다.',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('예산 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

/**
 * 단일 예산 상세 정보 조회 컨트롤러 함수
 * 
 * 특정 예산의 상세 정보와 실제 지출 대비 진행 상황 제공.
 * 예산 사용률, 남은 금액, 예상 지출 등의 분석 데이터 포함.
 * 
 * @param req - 인증된 사용자 요청 객체 (예산 ID 포함)
 * @param res - HTTP 응답 객체
 * @returns 예산 상세 정보와 진행 상황 분석
 */
export const getBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    // Repository를 사용하여 예산 진행 상황 조회
    const progress = await budgetRepository.getBudgetProgress(parseInt(id), userId);

    if (!progress) {
      return res.status(404).json({
        success: false,
        error: '예산을 찾을 수 없습니다.'
      });
    }

    // 카테고리 정보 추가
    const categoryResult = await pool.query(
      'SELECT label_ko as category_name, primary_category, secondary_category, icon, color FROM categories WHERE category_key = $1',
      [progress.budget.category_key]
    );

    const enhancedBudget = {
      ...progress.budget,
      category_name: categoryResult.rows[0]?.category_name || progress.budget.category_key,
      primary_category: categoryResult.rows[0]?.primary_category,
      secondary_category: categoryResult.rows[0]?.secondary_category,
      icon: categoryResult.rows[0]?.icon,
      color: categoryResult.rows[0]?.color
    };

    const response: ApiResponse = {
      success: true,
      data: { 
        budget: enhancedBudget,
        progress: {
          spent_amount: progress.spent_amount,
          remaining_amount: progress.remaining_amount,
          percentage_used: progress.percentage_used,
          days_remaining: progress.days_remaining,
          is_exceeded: progress.is_exceeded,
          daily_average_spending: progress.daily_average_spending,
          projected_spending: progress.projected_spending,
          is_on_track: progress.is_on_track
        }
      },
      message: '예산 정보를 조회했습니다.',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('예산 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

/**
 * 사용자의 전체 예산 요약 정보 조회 컨트롤러 함수
 * 
 * 모든 예산의 통합 현황과 통계 정보 제공.
 * 대시보드나 요약 화면에서 사용되는 핵심 지표들 포함.
 * 
 * @param req - 인증된 사용자 요청 객체
 * @param res - HTTP 응답 객체
 * @returns 예산 통합 요약 정보
 */
export const getBudgetSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    // Repository를 사용하여 예산 요약 조회
    const summary = await budgetRepository.getBudgetSummary(userId);

    const response: ApiResponse = {
      success: true,
      data: { summary },
      message: '예산 요약 정보를 조회했습니다.',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('예산 요약 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

/**
 * 예산 관련 알림 목록 조회 컨트롤러 함수
 * 
 * 예산 초과, 임계점 도달, 기간 만료 등의 알림 정보를 제공.
 * 사용자에게 예산 관리에 대한 주의사항이나 경고를 전달.
 * 
 * @param req - 인증된 사용자 요청 객체
 * @param res - HTTP 응답 객체
 * @returns 예산 알림 목록
 */
export const getBudgetAlerts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    // Repository를 사용하여 예산 알림 조회
    const alerts = await budgetRepository.getBudgetAlerts(userId);

    const response: ApiResponse = {
      success: true,
      data: { alerts },
      message: '예산 알림을 조회했습니다.',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('예산 알림 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

/**
 * 기존 예산 정보 수정 컨트롤러 함수
 * 
 * 예산 금액, 기간 등의 정보 부분적으로 업데이트 가능.
 * 동적 쿼리 생성을 통해 변경된 필드만 업데이트.
 * 
 * 수정 가능한 필드:
 * - amount: 예산 금액
 * - period_start: 예산 시작일
 * - period_end: 예산 종료일
 * 
 * 검증 사항:
 * - 예산 소유권 확인 (본인 예산만 수정 가능)
 * - 최소 하나 이상의 수정 필드 존재
 * - 업데이트 시간 자동 갱신
 * 
 * @param req - 인증된 사용자 요청 객체 (예산 ID 및 수정 데이터 포함)
 * @param res - HTTP 응답 객체
 * @returns 수정된 예산 정보
 */
export const updateBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { amount, period_start, period_end } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    // 예산 존재 여부 확인
    const existingBudget = await pool.query(
      'SELECT id FROM budgets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingBudget.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '예산을 찾을 수 없습니다.'
      });
    }

    // 업데이트할 필드들을 동적으로 구성
    const updateFields: string[] = [];
    const values: (string | number)[] = [];
    let paramCounter = 1;

    if (amount !== undefined) {
      updateFields.push(`amount = $${paramCounter++}`);
      values.push(amount);
    }

    if (period_start !== undefined) {
      updateFields.push(`period_start = $${paramCounter++}`);
      values.push(period_start);
    }

    if (period_end !== undefined) {
      updateFields.push(`period_end = $${paramCounter++}`);
      values.push(period_end);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: '업데이트할 필드가 없습니다.'
      });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id, userId);

    const query = `
      UPDATE budgets 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCounter++} AND user_id = $${paramCounter}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    const response: ApiResponse = {
      success: true,
      data: { budget: result.rows[0] },
      message: '예산이 수정되었습니다.',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('예산 수정 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

/**
 * 예산 삭제 컨트롤러 함수
 * 
 * 사용자의 기존 예산 완전히 삭제.
 * 소유권 검증을 통해 본인의 예산만 삭제 가능.
 * 
 * 보안 검증:
 * - 사용자 인증 상태 확인
 * - 예산 소유권 확인 (user_id 매칭)
 * - 존재하지 않는 예산에 대한 404 처리
 * 
 * 참고:
 * - 하드 삭제로 데이터가 완전히 제거됨
 * - 삭제된 예산과 관련된 거래 데이터는 유지됨
 * 
 * @param req - 인증된 사용자 요청 객체 (예산 ID 포함)
 * @param res - HTTP 응답 객체
 * @returns 삭제 성공/실패 메시지
 */
export const deleteBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    const result = await pool.query(
      'DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '예산을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '예산이 삭제되었습니다.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('예산 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

/**
 * 현재 월의 예산 현황 요약 및 조회하는 컨트롤러 함수
 * 
 * 이번 달에 해당하는 모든 예산의 실행 현황 분석하여 제공.
 * 월별 예산 관리 대시보드의 핵심 데이터 생성.
 * 
 * 제공 정보:
 * - 개별 예산별 지출 현황 및 잔여 금액
 * - 예산 사용률 및 초과 여부 분석
 * - 월 전체 예산 통계 (총 예산, 총 지출, 초과 건수)
 * - 카테고리별 예산 진행 상황
 * 
 * @param req - 인증된 사용자 요청 객체
 * @param res - HTTP 응답 객체
 * @returns 현재 월 예산 현황 요약 정보
 */
export const getCurrentMonthBudgetSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const monthStart = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const monthEnd = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

    // 현재 월의 모든 예산 조회
    const budgetsQuery = `
      SELECT b.*, c.label_ko as category_name, c.primary_category
      FROM budgets b
      LEFT JOIN categories c ON b.category_key = c.category_key
      WHERE b.user_id = $1 
        AND b.period_start <= $2 
        AND b.period_end >= $3
      ORDER BY c.primary_category, c.label_ko
    `;

    const budgets = await pool.query(budgetsQuery, [userId, monthEnd, monthStart]);

    // 각 예산별 실제 지출 계산
    const budgetSummary = await Promise.all(
      budgets.rows.map(async (budget) => {
        const expenseResult = await pool.query(
          `SELECT COALESCE(SUM(amount), 0) as total_spent
           FROM transactions 
           WHERE user_id = $1 AND category_key = $2 
             AND transaction_type = 'expense'
             AND transaction_date >= $3 AND transaction_date <= $4`,
          [userId, budget.category_key, monthStart, monthEnd]
        );

        const totalSpent = parseFloat(expenseResult.rows[0].total_spent);
        const budgetAmount = parseFloat(budget.amount);
        const remaining = budgetAmount - totalSpent;
        const percentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;

        return {
          ...budget,
          total_spent: totalSpent,
          remaining: remaining,
          percentage_used: percentage,
          is_over_budget: totalSpent > budgetAmount
        };
      })
    );

    // 전체 요약 계산
    const totalBudget = budgetSummary.reduce((sum, b) => sum + parseFloat(b.amount), 0);
    const totalSpent = budgetSummary.reduce((sum, b) => sum + b.total_spent, 0);
    const totalRemaining = totalBudget - totalSpent;
    const overBudgetCategories = budgetSummary.filter(b => b.is_over_budget).length;

    const response: ApiResponse = {
      success: true,
      data: { 
        summary: {
          total_budget: totalBudget,
          total_spent: totalSpent,
          total_remaining: totalRemaining,
          overall_percentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
          over_budget_count: overBudgetCategories,
          budget_count: budgetSummary.length
        },
        budgets: budgetSummary,
        period: { year: currentYear, month: currentMonth }
      },
      message: '현재 월 예산 현황을 조회했습니다.',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('예산 현황 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};