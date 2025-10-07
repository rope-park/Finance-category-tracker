
/**
 * 반복 거래 스케줄링 서비스
 * 
 * 정기적으로 발생하는 거래(월급, 구독료, 공과금 등)를 자동으로 생성하는 서비스.
 * 반복 템플릿을 기반으로 지정된 주기마다 실제 거래를 자동 생성함.
 * 
 * 지원 주기:
 * - 매일 (daily): 매일 반복
 * - 매주 (weekly): 매주 특정 요일 반복  
 * - 매월 (monthly): 매월 특정 날짜 반복
 * - 매년 (yearly): 매년 특정 날짜 반복
 * 
 * 주요 기능:
 * - 반복 템플릿 기반 자동 거래 생성
 * - 다음 실행 날짜 자동 계산 및 업데이트
 * - 사용자별 반복 거래 관리
 * - 스케줄 기반 배치 처리
 * 
 * @author Ju Eul Park (rope-park)
 */

import { RecurringTemplateRepository, RecurringTemplate } from './recurring-template.repository';
import { TransactionRepository } from './transaction.repository';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';

/**
 * 반복 거래 스케줄러 클래스
 * 
 * 반복 거래 템플릿을 기반으로 자동으로 거래를 생성 및 관리하는 스케줄링 서비스.
 * 크론 및 배치 작업에서 정기적으로 호출됨.
 */
export class RecurringTransactionScheduler {
  /** 반복 템플릿 데이터 접근 객체 */
  private static templateRepo = new RecurringTemplateRepository();
  
  /** 거래 데이터 접근 객체 */
  private static transactionRepo = new TransactionRepository();

  /**
   * 실행 예정인 반복 거래 템플릿들 처리
   * 
   * 오늘 날짜가 되어 실행해야 할 반복 템플릿들을 찾아서
   * 실제 거래로 생성하고, 다음 실행 날짜를 업데이트함.
   * 
   * @param today - 기준 날짜 (기본값: 현재 날짜)
   */
  static async processDueTemplates(today: Date = new Date()) {
    // 모든 활성 템플릿 조회 (실제로는 사용자별로 호출해야 함)
    const allTemplates: RecurringTemplate[] = await this.templateRepo.findByUser(undefined as any);
    
    // 오늘 실행해야 할 템플릿들 필터링
    const dueTemplates = allTemplates.filter(tpl => 
      tpl.is_active && tpl.next_occurrence <= today
    );

    // 각 템플릿마다 실제 거래 생성 및 다음 날짜 업데이트
    for (const tpl of dueTemplates) {
      // 템플릿 기반으로 실제 거래 생성
      await this.transactionRepo.createTransaction({
        user_id: tpl.user_id,                                        // 사용자 ID
        account_id: '1',                                             // 기본 계정 ID
        category_id: tpl.category_key,                               // 카테고리 ID
        type: tpl.transaction_type as 'income' | 'expense',          // 거래 유형
        amount: tpl.amount,                                          // 금액
        description: tpl.description ?? '',                          // 설명
        transaction_date: tpl.next_occurrence,                       // 거래 날짜
      });

      // 반복 주기에 따라 다음 실행 날짜 계산
      let nextDate = tpl.next_occurrence;
      switch (tpl.frequency) {
        case 'daily':
          nextDate = addDays(new Date(tpl.next_occurrence), tpl.interval);
          break;
        case 'weekly':
          nextDate = addWeeks(new Date(tpl.next_occurrence), tpl.interval);
          break;
        case 'monthly':
          nextDate = addMonths(new Date(tpl.next_occurrence), tpl.interval);
          break;
        case 'yearly':
          nextDate = addYears(new Date(tpl.next_occurrence), tpl.interval);
          break;
      }
      
      // 계산된 다음 실행 날짜로 템플릿 업데이트
      await this.templateRepo.updateNextOccurrence(tpl.id, nextDate);
    }
  }
}