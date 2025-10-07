/**
 * 예산 초과 모니터링 및 자동 알림 스케줄러
 * 
 * 사용자들의 예산 사용 현황을 주기적으로 감시하여 예산 초과 시 자동으로 알림을 발송하는 배경 작업.
 * 크론 작업으로 실행되어 사용자의 재정 관리를 도와주는 능동적 모니터링 시스템.
 * 
 * 주요 기능:
 * - 활성 예산을 가진 사용자 자동 탐지
 * - 월별 예산 초과 여부 실시간 검사
 * - 예산 초과 시 지능형 알림 자동 생성
 * - 예산 사용 패턴 분석 및 예측
 * 
 * @author Ju Eul Park (rope-park)
 */

import { BudgetRepository } from './budget.repository';
import { SmartAlertService } from './alert.service';

/**
 * 예산 알림 스케줄러 메인 실행 함수
 * 
 * 모든 활성 사용자의 예산을 순회하며 초과 여부 확인 및 필요시 알림 생성.
 * 일반적으로 매일 또는 매시간 실행됨.
 * 
 * 현재 지원 범위:
 * - 월별 예산만 지원 (period_type === 'monthly')
 * - TODO: 주별, 일별, 연별 예산 확장 예정
 */
export async function runBudgetAlertScheduler() {
  // 예산 데이터 접근을 위한 리포지토리 인스턴스 생성
  const budgetRepo = new BudgetRepository();
  
  // 활성 예산을 가진 모든 사용자 ID 수집
  const userIds = await budgetRepo.getAllUserIdsWithActiveBudgets();
  
  // 각 사용자별로 예산 초과 검사 수행
  for (const user_id of userIds) {
    // 해당 사용자의 모든 활성 예산 조회
    const budgets = await budgetRepo.findActiveBudgets(user_id);
    
    // 각 예산별로 초과 여부 확인
    for (const budget of budgets) {
      // 현재는 월별 예산만 지원 (향후 다른 기간 타입 확장 예정)
      if (budget.period_type === 'monthly') {
        // 현재 날짜 기준으로 월/년 정보 추출
        const now = new Date();
        const month = now.getMonth() + 1;  // JavaScript의 getMonth()는 0부터 시작하므로 +1
        const year = now.getFullYear();
        
        // 지능형 알림 서비스를 통해 예산 초과 여부 확인 및 알림 전송
        await SmartAlertService.checkBudgetExceeded(user_id, budget.amount, month, year);
      }
    }
  }
}