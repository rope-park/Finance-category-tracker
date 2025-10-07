/**
 * 분석 데이터 처리 담당 비즈니스 로직 서비스
 * 
 * 거래 데이터를 기반 통계와 분석 정보 생성하는 핵심 서비스.
 * Repository에서 가져온 원시 데이터를 가공하여 사용자에게 의미있는 인사이트 제공.
 *
 * 주요 기능들:
 * - 월별/연별 지출 패턴 분석 및 통계 계산
 * - 카테고리별 세부 지출 분석 및 비율 계산  
 * - 예산 대비 실제 지출 비교 분석
 * - 지출 트렌드 분석 및 예측 데이터 생성
 * - 대시보드에 표시할 요약 정보 및 인사이트 제공
 * - 사용자 맞춤형 재정 조언 및 개선점 도출
 * 
 * @author Ju Eul Park (rope-park)
 */

import { AnalyticsRepository } from './analytics.repository';
import logger from '../../shared/utils/logger';

/**
 * 분석 서비스 비즈니스 로직 클래스
 * 
 * Repository 패턴을 사용하여 데이터 접근과 비즈니스 로직 분리.
 * 거래 데이터 분석과 통계 생성을 담당하는 서비스 레이어.
 */
export class AnalyticsService {
  private analyticsRepo: AnalyticsRepository;

  // 생성자 - AnalyticsRepository를 초기화하여 데이터 접근 준비
  constructor() {
    this.analyticsRepo = new AnalyticsRepository();
  }

  /**
   * 사용자 기본 통계 요약 정보 조회
   * @param userId - 사용자 ID
   * @returns 사용자 기본 통계 요약 정보
   */
  async getUserAnalyticsSummary(userId: number) {
    try {
      // Repository에서 사용자의 기본 통계 데이터를 조회
      return await this.analyticsRepo.getUserAnalyticsSummary(userId);
    } catch (error) {
      // 에러 발생 시 로그 기록 후 상위로 전파
      logger.error('Analytics service error getting summary:', error);
      throw error;
    }
  }

  /**
   * 사용자 지출 트렌드 데이터 조회
   * @param userId - 사용자 ID
   * @param period - 조회 기간 (기본값: 6개월)
   * @returns 사용자 지출 트렌드 데이터
   */
  async getSpendingTrends(userId: number, period: string = '6months') {
    try {
      // 기본값은 6개월로 설정되어 있음 (1month, 3months, 6months, 1year 등 지원)
      return await this.analyticsRepo.getSpendingTrends(userId, period);
    } catch (error) {
      logger.error('Analytics service error getting trends:', error);
      throw error;
    }
  }

  /**
   * 카테고리별 지출 분석 데이터 조회
   * @param userId - 사용자 ID
   * @param period - 조회 기간 (기본값: 1개월)
   * @returns 카테고리별 지출 분석 데이터
   */
  async getCategoryBreakdown(userId: number, period: string = '1month') {
    try {
      // 기본값은 1개월로 설정 (최근 한 달간의 카테고리별 지출 현황)
      return await this.analyticsRepo.getCategoryBreakdown(userId, period);
    } catch (error) {
      logger.error('Analytics service error getting breakdown:', error);
      throw error;
    }
  }

  /**
   * 사용자 맞춤형 인사이트 생성
   * @param userId - 사용자 ID
   * @returns 사용자 맞춤형 인사이트 데이터
   */
  async generateInsights(userId: number) {
    try {
      // 병렬 처리로 여러 데이터를 동시에 가져와 성능 최적화
      const [summary, trends, breakdown] = await Promise.all([
        this.getUserAnalyticsSummary(userId),        // 기본 요약 정보
        this.getSpendingTrends(userId, '6months'),   // 6개월 트렌드 데이터
        this.getCategoryBreakdown(userId, '3months') // 3개월 카테고리 분석
      ]);

      // 데이터 기반으로 인사이트 동적 생성
      const insights = [];

      // 가장 많이 지출하는 카테고리 분석 인사이트
      if (breakdown.length > 0) {
        const topCategory = breakdown[0];  // 가장 지출이 많은 카테고리
        insights.push({
          type: 'spending_pattern',
          title: 'Top Spending Category',
          message: `You spend most on ${topCategory.category} (${topCategory.percentage}% of expenses)`,
          category: topCategory.category,
          // 30% 이상이면 주의 필요, 그 이하는 보통 수준
          impact: topCategory.percentage > 30 ? 'high' : 'medium'
        });
      }

      // 월 평균 지출 인사이트
      if (summary.avgMonthlySpending > 0) {
        insights.push({
          type: 'monthly_average',
          title: 'Monthly Spending Average',
          message: `Your average monthly spending is $${summary.avgMonthlySpending.toFixed(2)}`,
          amount: summary.avgMonthlySpending,
          impact: 'info'  // 정보성 인사이트 (경고나 주의가 아닌 단순 정보)
        });
      }

      // 모든 분석 데이터와 인사이트를 통합하여 반환
      return {
        summary,    // 기본 요약 정보
        trends,     // 지출 트렌드
        breakdown,  // 카테고리별 지출 분석
        insights    // AI 같은 인사이트
      };
    } catch (error) {
      logger.error('Analytics service error generating insights:', error);
      throw error;
    }
  }
}