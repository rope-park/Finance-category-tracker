
import { BudgetRepository, CreateBudgetData, UpdateBudgetData, BudgetRecord } from './budget.repository';

export class BudgetService {
  private static repo = new BudgetRepository();

  static async getBudgets(userId: number): Promise<BudgetRecord[]> {
    const { budgets } = await this.repo.findManyBudgets({ user_id: userId });
    return budgets;
  }

  // 예산 진행률 조회
  static async getBudgetProgress(userId: number): Promise<any> {
    // 예산별로 사용량, 남은 금액, 퍼센트 등 계산
    const budgets = await this.repo.findActiveBudgets(userId);
    // 실제 사용량 계산 로직은 도메인에 맞게 구현 필요
    // 예시: 각 예산별로 spent_amount, remaining_amount 등 계산
    return budgets.map(budget => ({
      ...budget,
      spent_amount: 0, // TODO: 실제 계산
      remaining_amount: budget.amount, // TODO: 실제 계산
      percentage_used: 0, // TODO: 실제 계산
      days_remaining: 0, // TODO: 실제 계산
      is_exceeded: false // TODO: 실제 계산
    }));
  }

  // 예산 알림 조회
  static async getBudgetAlerts(userId: number): Promise<any[]> {
    // 예산 초과, 임박 등 알림 로직 구현 필요
    // 예시: 예산별로 경고/초과/임박 등 메시지 생성
    const budgets = await this.repo.findActiveBudgets(userId);
    // TODO: 실제 알림 로직 구현
    return budgets.map(budget => ({
      budget_id: budget.id,
      category_key: budget.category_key,
      alert_type: 'warning',
      message: '예산 임박',
      percentage_used: 0,
      days_remaining: 0
    }));
  }

  // 월별 예산 요약
  static async getMonthlyBudgetSummary(userId: number, year: number, month: number): Promise<any> {
    // 해당 월의 예산 요약 정보 반환
    const { budgets } = await this.repo.findManyBudgets({ user_id: userId });
    // TODO: 실제 월별 요약 로직 구현
    return {
      year,
      month,
      total_budgets: budgets.length,
      total_amount: budgets.reduce((sum, b) => sum + b.amount, 0)
    };
  }

  static async getBudgetById(budgetId: number, userId: number): Promise<BudgetRecord | null> {
    return this.repo.findById(budgetId, userId);
  }

  static async createBudget(data: CreateBudgetData): Promise<BudgetRecord> {
    return this.repo.createBudget(data);
  }

  static async updateBudget(budgetId: number, userId: number, data: UpdateBudgetData): Promise<BudgetRecord | null> {
    return this.repo.updateBudget(budgetId, userId, data);
  }

  static async deleteBudget(budgetId: number, userId: number): Promise<boolean> {
    return this.repo.deleteBudget(budgetId, userId);
  }
}
