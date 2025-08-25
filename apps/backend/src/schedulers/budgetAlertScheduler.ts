// budgetAlertScheduler.ts
// 매일/매월 예산 초과 감지 및 알림 자동 생성
import { BudgetRepository } from '../repositories/BudgetRepository';
import { SmartAlertService } from '../services/smartAlertService';

export async function runBudgetAlertScheduler() {
  const budgetRepo = new BudgetRepository();
  const userIds = await budgetRepo.getAllUserIdsWithActiveBudgets();
  for (const user_id of userIds) {
    const budgets = await budgetRepo.findActiveBudgets(user_id);
    for (const budget of budgets) {
      // 월별 예산만 우선 지원
      if (budget.period_type === 'monthly') {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        await SmartAlertService.checkBudgetExceeded(user_id, budget.amount, month, year);
      }
    }
  }
}