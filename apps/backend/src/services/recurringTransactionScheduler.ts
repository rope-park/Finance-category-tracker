
import { RecurringTemplateRepository, RecurringTemplate } from '../repositories/RecurringTemplateRepository';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';

export class RecurringTransactionScheduler {
  private static templateRepo = new RecurringTemplateRepository();
  private static transactionRepo = new TransactionRepository();

  /**
   * 반복 거래 자동 생성 (매일/매주/매월/매년)
   * - 오늘이 next_occurrence 이상인 템플릿을 찾아 실제 거래로 생성
   * - 생성 후 next_occurrence를 다음 주기로 업데이트
   */
  static async processDueTemplates(today: Date = new Date()) {
    // 모든 활성 템플릿을 가져와 today와 next_occurrence 비교
    const allTemplates: RecurringTemplate[] = await this.templateRepo.findByUser(undefined as any); // findByUser(user_id) 기반이므로, 실제 서비스에서는 user별로 반복 호출 필요
    const dueTemplates = allTemplates.filter(tpl => tpl.is_active && tpl.next_occurrence <= today);

    for (const tpl of dueTemplates) {
      await this.transactionRepo.createTransaction({
        user_id: tpl.user_id,
        category_key: tpl.category_key,
        transaction_type: tpl.transaction_type,
        amount: tpl.amount,
        description: tpl.description ?? '',
        transaction_date: tpl.next_occurrence,
      });

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
      // next_occurrence는 별도 메서드로 업데이트
  await this.templateRepo.updateNextOccurrence(tpl.id, nextDate);
    }
  }
}