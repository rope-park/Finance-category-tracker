/**
 * 예산 관리 서비스
 * 
 * 사용자의 지출 예산을 카테고리별, 기간별 설정 및 관리하는 서비스.
 * 예산 초과 방지와 재정 관리 도와주는 핵심 기능 제공.
 * 
 * 주요 기능:
 * - 카테고리별 예산 설정 및 관리
 * - 월별, 주별, 일별 예산 기간 설정
 * - 예산 사용량 추적 및 모니터링
 * - 예산 초과 시 자동 알림 및 경고
 * 
 * @author Ju Eul Park (rope-park)
 */

import { BudgetRepository, CreateBudgetData, UpdateBudgetData, BudgetRecord } from './budget.repository';

/**
 * 예산 관리 비즈니스 로직 클래스
 * 
 * Repository 패턴을 사용하여 데이터 접근과 비즈니스 로직을 분리.
 * 사용자의 예산 설정과 관리를 담당하는 서비스 레이어.
 */
export class BudgetService {
  private static repo = new BudgetRepository();

  /**
   * 사용자 예산 목록 조회
   * @param userId - 예산을 조회할 사용자 ID
   * @returns 사용자의 예산 목록
   */
  static async getBudgets(userId: number): Promise<BudgetRecord[]> {
    const { budgets } = await this.repo.findManyBudgets({ user_id: userId });
    return budgets;
  }

  /**
   * 예산별 진행률 및 사용 현황 조회
   * @param userId - 예산 진행률을 조회할 사용자 ID
   * @returns 예산별 진행률 및 사용 현황 데이터
   */
  static async getBudgetProgress(userId: number): Promise<any> {
    // 활성 예산 목록 조회
    const budgets = await this.repo.findActiveBudgets(userId);
    
    // 각 예산별로 사용량, 남은 금액, 퍼센트 등 계산
    // TODO: 실제 거래 데이터와 연동하여 사용량 계산 구현
    return budgets.map(budget => ({
      ...budget,
      spent_amount: 0, // TODO: 실제 사용 금액 계산
      remaining_amount: budget.amount, // TODO: 남은 예산 계산
      percentage_used: 0, // TODO: 예산 사용률 계산
      days_remaining: 0, // TODO: 예산 종료까지 남은 일수
      is_exceeded: false // TODO: 예산 초과 여부 판정
    }));
  }

  /**
   * 예산 관련 알림 조회
   * @param userId - 알림을 조회할 사용자 ID
   * @returns 예산 관련 알림 목록
   */
  static async getBudgetAlerts(userId: number): Promise<any[]> {
    // 활성 예산 목록 조회
    const budgets = await this.repo.findActiveBudgets(userId);
    
    // TODO: 실제 거래 데이터와 연동하여 알림 로직 구현
    // 예산별로 경고/초과/임박 등의 상황에 따른 알림 메시지 생성
    return budgets.map(budget => ({
      budget_id: budget.id,
      category_key: budget.category_key,
      alert_type: 'warning', // 'info', 'warning', 'danger' 등
      message: '예산 임박', // 상황에 맞는 메시지
      percentage_used: 0, // 예산 사용률
      days_remaining: 0 // 예산 기간 종료까지 남은 일수
    }));
  }

  /**
   * 월별 예산 요약 정보 조회
   * @param userId - 요약을 조회할 사용자 ID
   * @param year - 요약할 년도
   * @param month - 요약할 월
   * @returns 월별 예산 요약 정보
   */
  static async getMonthlyBudgetSummary(userId: number, year: number, month: number): Promise<any> {
    // 해당 사용자의 모든 예산 조회
    const { budgets } = await this.repo.findManyBudgets({ user_id: userId });
    
    // TODO: 실제 월별 요약 로직 구현 (특정 월 필터링, 사용량 계산 등)
    return {
      year,
      month,
      total_budgets: budgets.length, // 전체 예산 개수
      total_amount: budgets.reduce((sum, b) => sum + b.amount, 0) // 전체 예산 금액 합계
      // TODO: total_spent, total_remaining, categories_exceeded 등 추가
    };
  }

  /**
   * 특정 예산 조회
   * @param budgetId - 조회할 예산 ID
   * @param userId - 예산 소유자 ID (보안 검사용)
   * @returns 예산 객체 (없으면 null)
   */
  static async getBudgetById(budgetId: number, userId: number): Promise<BudgetRecord | null> {
    return this.repo.findById(budgetId, userId);
  }

  /**
   * 새로운 예산 생성
   * @param data - 예산 생성에 필요한 데이터
   * @returns 생성된 예산 객체
   */
  static async createBudget(data: CreateBudgetData): Promise<BudgetRecord> {
    return this.repo.createBudget(data);
  }

  /**
   * 기존 예산 수정
   * @param budgetId - 수정할 예산 ID
   * @param userId - 예산 소유자 ID (보안 검사용)
   * @param data - 수정할 데이터
   * @returns 수정된 예산 객체 (실패 시 null)
   */
  static async updateBudget(budgetId: number, userId: number, data: UpdateBudgetData): Promise<BudgetRecord | null> {
    return this.repo.updateBudget(budgetId, userId, data);
  }

  /**
   * 예산 삭제
   * @param budgetId - 삭제할 예산 ID
   * @param userId - 예산 소유자 ID (보안 검사용)
   * @returns 삭제 성공 여부
   */
  static async deleteBudget(budgetId: number, userId: number): Promise<boolean> {
    return this.repo.deleteBudget(budgetId, userId);
  }
}
