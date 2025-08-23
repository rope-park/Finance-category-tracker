// BudgetRepository.ts 정상 구조 복구
import { BaseRepository } from './BaseRepository';

export interface BudgetRecord {
  id: number;
  user_id: number;
  category_key: string;
  amount: number;
  period_type: 'monthly' | 'weekly' | 'daily';
  start_date: Date;
  end_date: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBudgetData {
  user_id: number;
  category_key: string;
  amount: number;
  period_type: 'monthly' | 'weekly' | 'daily';
  start_date: Date;
  end_date: Date;
  is_active?: boolean;
}

export interface UpdateBudgetData {
  category_key?: string;
  amount?: number;
  period_type?: 'monthly' | 'weekly' | 'daily';
  start_date?: Date;
  end_date?: Date;
  is_active?: boolean;
}

export interface BudgetFilters {
  user_id?: number;
  category_key?: string;
  period_type?: 'monthly' | 'weekly' | 'daily';
  is_active?: boolean;
  start_date_from?: Date;
  start_date_to?: Date;
  amount_min?: number;
  amount_max?: number;
}

export interface BudgetProgress {
  budget: BudgetRecord;
  spent_amount: number;
  remaining_amount: number;
  percentage_used: number;
  days_remaining: number;
  is_exceeded: boolean;
  daily_average_spending: number;
  projected_spending: number;
  is_on_track: boolean;
}

export interface BudgetSummary {
  total_budgets: number;
  active_budgets: number;
  total_budget_amount: number;
  total_spent: number;
  total_remaining: number;
  exceeded_budgets: number;
  on_track_budgets: number;
  average_utilization: number;
}

export interface BudgetAlert {
  budget_id: number;
  category_key: string;
  alert_type: 'warning' | 'exceeded' | 'near_end';
  message: string;
  percentage_used: number;
  days_remaining: number;
}

export class BudgetRepository extends BaseRepository {
  private readonly tableName = 'budgets';
  private readonly transactionTableName = 'transactions';

  /**
   * 활성 예산이 있는 전체 사용자 ID 목록 반환
   */
  async getAllUserIdsWithActiveBudgets(): Promise<number[]> {
    const result = await this.executeRawQuery<{ user_id: number }>(
      `SELECT DISTINCT user_id FROM ${this.tableName} WHERE is_active = true`
    );
    return result.rows.map(r => r.user_id);
  }

  /**
   * 예산 생성
   */
  async createBudget(data: CreateBudgetData): Promise<BudgetRecord> {
    return await this.create<BudgetRecord>(this.tableName, data);
  }

  /**
   * 예산 단건 조회 (userId 포함)
   */
  async findById(id: number, userId: number): Promise<BudgetRecord | null> {
    return await this.findOne<BudgetRecord>(this.tableName, { id, user_id: userId });
  }

  /**
   * 예산 다건 조회 (필터)
   */
  async findManyBudgets(filters: BudgetFilters): Promise<{ budgets: BudgetRecord[] }> {
    // 간단한 where절 조립
    const where: any = {};
    if (filters.user_id) where.user_id = filters.user_id;
    if (filters.category_key) where.category_key = filters.category_key;
    if (filters.period_type) where.period_type = filters.period_type;
    if (filters.is_active !== undefined) where.is_active = filters.is_active;
    if (filters.amount_min !== undefined) where.amount = { operator: '>=', value: filters.amount_min };
    if (filters.amount_max !== undefined) where.amount = { operator: '<=', value: filters.amount_max };
    // 날짜 필터
    if (filters.start_date_from) where.start_date = { operator: '>=', value: filters.start_date_from };
    if (filters.start_date_to) where.start_date = { operator: '<=', value: filters.start_date_to };
    const budgets = await this.findMany<BudgetRecord>(this.tableName, where);
    return { budgets };
  }

  /**
   * 예산 수정
   */
  async updateBudget(id: number, userId: number, data: UpdateBudgetData): Promise<BudgetRecord | null> {
    return await this.update<BudgetRecord>(this.tableName, data, { id, user_id: userId });
  }

  /**
   * 예산 삭제
   */
  async deleteBudget(id: number, userId: number): Promise<boolean> {
    const result = await this.delete(this.tableName, { id, user_id: userId });
    return result !== null;
  }

  /**
   * 활성 예산 목록 조회
   */
  async findActiveBudgets(userId: number): Promise<BudgetRecord[]> {
    return await this.findMany<BudgetRecord>(this.tableName, { user_id: userId, is_active: true });
  }

  /**
   * 예산 비활성화
   */
  async deactivate(id: number, userId: number): Promise<BudgetRecord | null> {
    return await this.updateBudget(id, userId, { is_active: false });
  }

  /**
   * 예산 활성화
   */
  async activate(id: number, userId: number): Promise<BudgetRecord | null> {
    return await this.updateBudget(id, userId, { is_active: true });
  }

  /**
   * 만료된 예산 자동 비활성화
   */
  async deactivateExpiredBudgets(): Promise<number> {
    const now = new Date();
    const result = await this.executeRawQuery(
      `UPDATE ${this.tableName} SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE is_active = true AND end_date < $1`,
      [now]
    );
    return result.rowCount;
  }

  /**
   * 카테고리별 예산 히스토리
   */
  async getBudgetHistory(userId: number, categoryKey: string, limit: number = 10): Promise<BudgetRecord[]> {
    const result = await this.executeRawQuery<BudgetRecord>(
      `SELECT * FROM ${this.tableName} WHERE user_id = $1 AND category_key = $2 ORDER BY start_date DESC LIMIT $3`,
      [userId, categoryKey, limit]
    );
    return result.rows;
  }

  /**
   * 예산 성과 분석
   */
  async getBudgetPerformance(userId: number, months: number = 6): Promise<any[]> {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    const result = await this.executeRawQuery<any>(
      `WITH budget_performance AS (
        SELECT b.category_key, b.amount as budget_amount,
          COALESCE(t.spent_amount, 0) as spent_amount,
          CASE WHEN COALESCE(t.spent_amount, 0) <= b.amount THEN 1 ELSE 0 END as is_successful
        FROM ${this.tableName} b
        LEFT JOIN (
          SELECT category_key, SUM(amount) as spent_amount
          FROM ${this.transactionTableName}
          WHERE user_id = $1 AND transaction_type = 'expense' AND transaction_date >= $2
          GROUP BY category_key
        ) t ON b.category_key = t.category_key
        WHERE b.user_id = $1 AND b.start_date >= $2
      )
      SELECT category_key, SUM(budget_amount) as total_budget, SUM(spent_amount) as total_spent,
        COUNT(*) as budget_count, SUM(is_successful) as successful_budgets
      FROM budget_performance
      GROUP BY category_key
      ORDER BY total_budget DESC`,
      [userId, cutoffDate]
    );
    return result.rows.map(row => ({
      category_key: row.category_key,
      total_budget: parseFloat(row.total_budget),
      total_spent: parseFloat(row.total_spent),
      success_rate: parseInt(row.budget_count) > 0 ? (parseInt(row.successful_budgets) / parseInt(row.budget_count)) * 100 : 0,
      average_utilization: parseFloat(row.total_budget) > 0 ? (parseFloat(row.total_spent) / parseFloat(row.total_budget)) * 100 : 0,
      budget_count: parseInt(row.budget_count)
    }));
  }

  /**
   * 사용자 전체 예산 삭제 (계정 삭제 시)
   */
  async deleteAllByUser(userId: number): Promise<number> {
    const result = await this.executeRawQuery(
      `DELETE FROM ${this.tableName} WHERE user_id = $1`,
      [userId]
    );
    return result.rowCount;
  }
}
