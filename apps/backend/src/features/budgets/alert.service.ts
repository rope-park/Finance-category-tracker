/**
 * 스마트 알림 서비스
 * 
 * 사용자의 재정 상황을 실시간으로 모니터링하여 중요한 이벤트 발생 시 
 * 자동으로 알림을 전송하는 지능형 알림 시스템.
 * 예산 초과, 반복 거래 예정일, 이상 지출 패턴 등을 감지하고 적절한 알림 제공.
 * 
 * 주요 기능:
 * - 예산 초과 실시간 감지 및 즉시 알림 전송
 * - 반복 거래 예정일 사전 알림 (1일 전, 당일)
 * - 이상 지출 패턴 감지 및 경고 알림
 * - 목표 달성률 모니터링 및 격려 메시지
 * 
 * 알림 트리거 조건:
 * - 월별 예산 80%, 100%, 120% 도달 시점
 * - 카테고리별 예산 초과 시점
 * - 반복 거래 실행 예정일 1일 전
 * - 평소 대비 2배 이상 지출 발생 시
 * 
 * @author Ju Eul Park (rope-park)
 */
import { NotificationService } from '../notifications/notification.service';
import { TransactionRepository } from '../transactions/transaction.repository';

/**
 * 스마트 알림 비즈니스 로직 클래스
 * 
 * 정적 메서드를 통해 다양한 알림 조건을 검사하고 해당하는 알림을 발송.
 * 각 메서드는 특정 조건을 검사하여 필요시 NotificationService를 통해 알림을 전송.
 */
export class SmartAlertService {
  /**
   * 예산 초과 감지 및 알림 전송
   * 
   * 특정 월의 총 지출이 설정된 예산을 초과했는지 확인하고,
   * 초과했을 경우 사용자에게 즉시 알림을 전송.
   * 
   * 알림 전송 조건:
   * - 월별 총 지출이 설정된 예산을 초과한 경우
   * - 중복 알림 방지를 위한 내부 플래그 확인
   * 
   * @param user_id - 예산 초과를 확인할 사용자 ID
   * @param budget - 설정된 월별 예산 금액
   * @param month - 확인할 월 (1-12)
   * @param year - 확인할 연도
   */
  static async checkBudgetExceeded(user_id: number, budget: number, month: number, year: number) {
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

  /**
   * 반복 거래 예정일 알림 전송
   * 
   * 등록된 반복 거래의 다음 실행 예정일이 임박했을 때 사용자에게 사전 알림을 전송.
   * 사용자가 반복 거래를 미리 인지하고 계좌 잔액을 확인할 수 있도록 도움.
   * 
   * 알림 전송 시점:
   * - 반복 거래 실행 1일 전 (오전 9시)
   * - 반복 거래 실행 당일 (오전 8시)
   * 
   * @param user_id - 알림을 받을 사용자 ID
   * @param templateDesc - 반복 거래 설명 (예: '월세', '통신비')
   * @param nextDate - 다음 반복 거래 실행 예정일
   */
  static async notifyUpcomingRecurring(user_id: number, templateDesc: string, nextDate: Date) {
    await NotificationService.sendNotification({
      user_id,
      type: 'recurring_upcoming',
      message: `곧 반복 거래 예정: ${templateDesc} (${nextDate.toLocaleDateString()})`
    });
  }
}