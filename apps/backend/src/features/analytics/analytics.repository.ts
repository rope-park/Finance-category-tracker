/**
 * 분석 데이터 접근 레이어 (Repository)
 * 
 * 사용자의 재정 데이터를 기반으로 다양한 분석 지표와 통계 정보를 생성하는 데이터 접근 레이어.
 * 복잡한 SQL 쿼리를 통해 지출 패턴, 카테고리별 분석, 예산 사용률 등 계산.
 * 
 * 주요 기능:
 * - 사용자별 재정 요약 데이터 생성
 * - 월별/카테고리별 지출 트렌드 분석
 * - 예산 사용률 및 달성률 계산
 * - 대시보드용 차트 데이터 제공
 * 
 * @author Ju Eul Park (rope-park)
 */
import { BaseRepository } from '../../shared/repositories/BaseRepository';
import { Pool } from 'pg';
import logger from '../../shared/utils/logger';

/**
 * 사용자 재정 요약 데이터 인터페이스
 * 
 * 대시보드에서 사용되는 주요 지표들을 포함.
 * 전체 거래 현황과 예산 사용 현황을 한눈에 볼 수 있도록 구성.
 */
export interface AnalyticsSummary {
  totalTransactions: number;  // 전체 거래 수
  totalExpenses: number;      // 전체 지출 금액
  totalIncome: number;        // 전체 수입 금액
  avgMonthlySpending: number; // 월 평균 지출 금액
  topCategory: string;        // 가장 많이 지출한 카테고리
  budgetUtilization: number;  // 예산 사용률 (백분율)
}

/**
 * 지출 트렌드 데이터 인터페이스
 * 
 * 월별 지출 변화 추이를 나타내는 데이터 구조.
 * 시간에 따른 소비 패턴 변화를 추적하는 데 사용.
 */
export interface SpendingTrend {
  month: string;
  amount: number;
  category: string;
}

/**
 * 카테고리별 지출 분석 데이터 인터페이스
 * 
 * 각 카테고리의 지출 비중과 거래 현황 나타냄.
 * 파이 차트나 도넛 차트에서 사용되는 데이터 구조.
 */
export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;       // 전체 지출 대비 비율 (백분율)
  transactionCount: number; // 해당 카테고리의 거래 수
}

/**
 * 분석 데이터 접근 클래스
 * 
 * PostgreSQL 데이터베이스와 연동하여 복잡한 분석 쿼리 실행 및 결과 처리.
 * 대용량 데이터에 대한 성능 최적화 및 오류 처리 담당.
 */
export class AnalyticsRepository {
  /** 데이터베이스 연결 풀 인스턴스 */
  private pool: any;
  
  /**
   * 생성자 - 데이터베이스 연결 설정
   * 
   * 동적으로 데이터베이스 모듈 로드하여 연결 풀 초기화.
   * CommonJS와 ES Module 모두 지원하도록 구성.
   */
  constructor() {
    const poolModule = require('../../core/config/database');
    this.pool = poolModule.default || poolModule;
  }
  
  /**
   * 사용자별 재정 요약 데이터 조회
   * @param userId - 사용자 ID
   * @returns - 재정 요약 데이터 객체
   */
  async getUserAnalyticsSummary(userId: number): Promise<AnalyticsSummary> {
    const client = await this.pool.connect();
    try {
      // 전체 거래 현황 조회
      const transactionQuery = `
        SELECT 
          COUNT(*) as total_transactions,
          SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) as total_expenses,
          SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) as total_income
        FROM transactions 
        WHERE user_id = $1
      `;
      const transactionResult = await client.query(transactionQuery, [userId]);
      
      // 가장 많이 지출한 카테고리 조회
      const categoryQuery = `
        SELECT category_key, SUM(amount) as total
        FROM transactions 
        WHERE user_id = $1 AND transaction_type = 'expense'
        GROUP BY category_key 
        ORDER BY total DESC 
        LIMIT 1
      `;
      const categoryResult = await client.query(categoryQuery, [userId]);

      // 월 평균 지출 조회
      const avgQuery = `
        SELECT AVG(monthly_expense) as avg_monthly
        FROM (
          SELECT 
            DATE_TRUNC('month', transaction_date) as month,
            SUM(amount) as monthly_expense
          FROM transactions 
          WHERE user_id = $1 AND transaction_type = 'expense'
          GROUP BY DATE_TRUNC('month', transaction_date)
        ) monthly_totals
      `;
      const avgResult = await client.query(avgQuery, [userId]);

      return {
        totalTransactions: parseInt(transactionResult.rows[0]?.total_transactions || '0'),
        totalExpenses: parseFloat(transactionResult.rows[0]?.total_expenses || '0'),
        totalIncome: parseFloat(transactionResult.rows[0]?.total_income || '0'),
        avgMonthlySpending: parseFloat(avgResult.rows[0]?.avg_monthly || '0'),
        topCategory: categoryResult.rows[0]?.category_key || 'N/A',
        budgetUtilization: 0 // TODO: 예산 사용률 계산 로직 추가
      };
    } catch (error) {
      logger.error('Error getting analytics summary:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 지출 트렌드 데이터 조회
   * @param userId - 사용자 ID
   * @param period - 조회 기간
   * @returns - 지출 트렌드 데이터 배열
   */
  async getSpendingTrends(userId: number, period: string): Promise<SpendingTrend[]> {
    const client = await this.pool.connect();
    try {
      let dateFilter = '';
      // 기간에 따른 필터 설정
      switch (period) {
        case '6months':
          dateFilter = "AND transaction_date >= NOW() - INTERVAL '6 months'";
          break;
        case '1year':
          dateFilter = "AND transaction_date >= NOW() - INTERVAL '1 year'";
          break;
        default:
          dateFilter = "AND transaction_date >= NOW() - INTERVAL '6 months'";
      }

      const query = `
        SELECT 
          TO_CHAR(DATE_TRUNC('month', transaction_date), 'YYYY-MM') as month,
          category_key as category,
          SUM(amount) as amount
        FROM transactions 
        WHERE user_id = $1 AND transaction_type = 'expense' ${dateFilter}
        GROUP BY DATE_TRUNC('month', transaction_date), category_key
        ORDER BY month DESC, amount DESC
      `;
      
      const result = await client.query(query, [userId]);
      return result.rows;
    } catch (error) {
      logger.error('Error getting spending trends:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 카테고리별 지출 분석 데이터 조회
   * @param userId - 사용자 ID
   * @param period - 조회 기간
   * @returns - 카테고리별 지출 분석 데이터 배열
   */
  async getCategoryBreakdown(userId: number, period: string): Promise<CategoryBreakdown[]> {
    const client = await this.pool.connect();
    try {
      let dateFilter = '';
      // 기간별 필터 설정
      switch (period) {
        case '1month':
          dateFilter = "AND transaction_date >= NOW() - INTERVAL '1 month'";
          break;
        case '3months':
          dateFilter = "AND transaction_date >= NOW() - INTERVAL '3 months'";
          break;
        case '1year':
          dateFilter = "AND transaction_date >= NOW() - INTERVAL '1 year'";
          break;
        default:
          dateFilter = "AND transaction_date >= NOW() - INTERVAL '1 month'";
      }

      const query = `
        WITH category_totals AS (
          SELECT 
            category_key as category,
            SUM(amount) as amount,
            COUNT(*) as transaction_count
          FROM transactions 
          WHERE user_id = $1 AND transaction_type = 'expense' ${dateFilter}
          GROUP BY category_key
        ),
        total_spending AS (
          SELECT SUM(amount) as total FROM category_totals
        )
        SELECT 
          ct.category,
          ct.amount,
          ct.transaction_count,
          ROUND((ct.amount / ts.total * 100)::numeric, 2) as percentage
        FROM category_totals ct
        CROSS JOIN total_spending ts
        ORDER BY ct.amount DESC
      `;
      
      const result = await client.query(query, [userId]);
      return result.rows.map(row => ({
        category: row.category,
        amount: parseFloat(row.amount),
        percentage: parseFloat(row.percentage),
        transactionCount: parseInt(row.transaction_count)
      }));
    } catch (error) {
      logger.error('Error getting category breakdown:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}