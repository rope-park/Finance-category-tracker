// BudgetRepository.ts 정상 구조 복구
import { BaseRepository } from '../../shared/repositories/BaseRepository';

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
  progress_percentage: number;  // 추가
  days_remaining: number;
  is_exceeded: boolean;
  is_over_budget: boolean;  // 추가
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
   * 데이터베이스 row를 BudgetRecord로 변환
   */
  private mapRowToBudget(row: any): BudgetRecord {
    return {
      id: row.id,
      user_id: row.user_id,
      category_key: row.category_key,
      amount: parseFloat(row.amount),
      period_type: row.period_type,
      start_date: new Date(row.start_date),
      end_date: new Date(row.end_date),
      is_active: row.is_active,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }

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

  /**
   * 겹치는 예산 찾기
   */
  async findOverlappingBudgets(
    userId: number,
    categoryKey: string,
    startDate: Date,
    endDate: Date,
    excludeId?: number
  ): Promise<BudgetRecord[]> {
    let query = `
      SELECT * FROM ${this.tableName}
      WHERE user_id = $1 
        AND category_key = $2 
        AND is_active = true
        AND (start_date <= $4 AND end_date >= $3)
    `;
    const params: any[] = [userId, categoryKey, startDate, endDate];

    if (excludeId) {
      query += ` AND id != $5`;
      params.push(excludeId);
    }

    const result = await this.executeRawQuery(query, params);
    return result.rows.map(row => this.mapRowToBudget(row));
  }

  /**
   * 예산 진행 상황 조회
   */
  async getBudgetProgress(budgetId: number, userId: number): Promise<BudgetProgress | null> {
    const result = await this.executeRawQuery(`
      SELECT 
        b.*,
        COALESCE(SUM(t.amount), 0) as spent_amount
      FROM ${this.tableName} b
      LEFT JOIN transactions t ON b.category_key = t.category_key 
        AND t.user_id = b.user_id 
        AND t.transaction_type = 'expense'
        AND t.transaction_date >= b.start_date 
        AND t.transaction_date <= b.end_date
      WHERE b.id = $1 AND b.user_id = $2
      GROUP BY b.id
    `, [budgetId, userId]);

    if (result.rows.length === 0) return null;

    const row: any = result.rows[0];
    const budget = this.mapRowToBudget(row);
    const spentAmount = parseFloat(row.spent_amount || '0');

    return {
      budget,
      spent_amount: spentAmount,
      remaining_amount: budget.amount - spentAmount,
      progress_percentage: budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0,
      percentage_used: budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0,
      is_over_budget: spentAmount > budget.amount,
      is_exceeded: spentAmount > budget.amount,
      days_remaining: Math.max(0, Math.ceil((budget.end_date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))),
      daily_average_spending: 0, // 계산 로직 추가 필요
      projected_spending: 0, // 계산 로직 추가 필요
      is_on_track: spentAmount <= budget.amount
    };
  }

  /**
   * 예산 요약 조회
   */
  async getBudgetSummary(userId: number): Promise<any> {
    const result = await this.executeRawQuery(`
      SELECT 
        COUNT(*) as total_budgets,
        SUM(b.amount) as total_budget_amount,
        SUM(COALESCE(t.spent_amount, 0)) as total_spent_amount,
        COUNT(CASE WHEN COALESCE(t.spent_amount, 0) <= b.amount THEN 1 END) as budgets_on_track,
        COUNT(CASE WHEN COALESCE(t.spent_amount, 0) > b.amount THEN 1 END) as budgets_over
      FROM ${this.tableName} b
      LEFT JOIN (
        SELECT 
          category_key,
          user_id,
          SUM(amount) as spent_amount
        FROM transactions 
        WHERE transaction_type = 'expense'
          AND transaction_date >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY category_key, user_id
      ) t ON b.category_key = t.category_key AND b.user_id = t.user_id
      WHERE b.user_id = $1 AND b.is_active = true
    `, [userId]);

    const row: any = result.rows[0];
    return {
      total_budgets: parseInt(row.total_budgets || '0'),
      total_budget_amount: parseFloat(row.total_budget_amount || '0'),
      total_spent_amount: parseFloat(row.total_spent_amount || '0'),
      budgets_on_track: parseInt(row.budgets_on_track || '0'),
      budgets_over: parseInt(row.budgets_over || '0'),
      average_utilization: parseFloat(row.total_budget_amount) > 0 
        ? (parseFloat(row.total_spent_amount) / parseFloat(row.total_budget_amount)) * 100 
        : 0
    };
  }

  /**
   * 예산 알림 조회
   */
  async getBudgetAlerts(userId: number): Promise<any[]> {
    const result = await this.executeRawQuery(`
      SELECT 
        b.*,
        COALESCE(SUM(t.amount), 0) as spent_amount,
        (COALESCE(SUM(t.amount), 0) / b.amount) * 100 as usage_percentage
      FROM ${this.tableName} b
      LEFT JOIN transactions t ON b.category_key = t.category_key 
        AND t.user_id = b.user_id 
        AND t.transaction_type = 'expense'
        AND t.transaction_date >= b.start_date 
        AND t.transaction_date <= b.end_date
      WHERE b.user_id = $1 
        AND b.is_active = true
        AND b.end_date >= CURRENT_DATE
      GROUP BY b.id
      HAVING (COALESCE(SUM(t.amount), 0) / b.amount) * 100 >= 80
      ORDER BY usage_percentage DESC
    `, [userId]);

    return result.rows.map((row: any) => ({
      budget: this.mapRowToBudget(row),
      spent_amount: parseFloat(row.spent_amount || '0'),
      usage_percentage: parseFloat(row.usage_percentage || '0'),
      alert_level: parseFloat(row.usage_percentage || '0') >= 100 ? 'critical' : 'warning'
    }));
  }
}