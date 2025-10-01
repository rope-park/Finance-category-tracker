// 예산 초과, 반복 거래 예정 등 스마트 알림 트리거 감지 및 전송
import { NotificationService } from '../notifications/notification.service';
import { TransactionRepository } from '../transactions/transaction.repository';

export class SmartAlertService {
  // 예산 초과 감지 및 알림
  static async checkBudgetExceeded(user_id: string, budget: number, month: number, year: number) {
    const repo = new TransactionRepository();
    const { totalExpenses } = await repo.getStatistics(user_id.toString(), new Date(`${year}-${month}-01`));
    if (totalExpenses > budget) {
      await NotificationService.sendNotification({
        user_id,
        type: 'budget_exceeded',
        message: `이번 달 지출이 예산(${budget.toLocaleString()}원)을 초과했습니다.`
      });
    }
  }

  // 반복 거래 예정일 알림 (예: 1일 전)
  static async notifyUpcomingRecurring(user_id: string, templateDesc: string, nextDate: Date) {
    await NotificationService.sendNotification({
      user_id,
      type: 'recurring_upcoming',
      message: `곧 반복 거래 예정: ${templateDesc} (${nextDate.toLocaleDateString()})`
    });
  }
}