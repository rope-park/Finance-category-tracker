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
   * 예산을 생성합니다
   */
  async createBudget(budgetData: CreateBudgetData): Promise<BudgetRecord> {
    const data = {
      ...budgetData,
      is_active: budgetData.is_active ?? true
    };

    return await super.create<BudgetRecord>(this.tableName, data);
  }

  /**
   * ID로 예산을 조회합니다
   */
  async findById(id: number, userId: number): Promise<BudgetRecord | null> {
    return await this.findOne<BudgetRecord>(
      this.tableName,
      { id, user_id: userId }
    );
  }

  /**
   * 예산을 업데이트합니다
   */
  async updateBudget(id: number, userId: number, data: UpdateBudgetData): Promise<BudgetRecord | null> {
    return await super.update<BudgetRecord>(
      this.tableName,
      data,
      { id, user_id: userId }
    );
  }

  /**
   * 예산을 삭제합니다
   */
  async deleteBudget(id: number, userId: number): Promise<boolean> {
    return await super.delete(this.tableName, { id, user_id: userId });
  }

  /**
   * 필터와 페이지네이션으로 예산 목록을 조회합니다
   */
  async findManyBudgets(
    filters: BudgetFilters,
    limit: number = 50,
    offset: number = 0,
    orderBy: string = 'created_at DESC'
  ): Promise<{
    budgets: BudgetRecord[];
    total: number;
  }> {
    const conditions: Record<string, any> = {};

    // 필터 조건 구성
    if (filters.user_id) conditions.user_id = filters.user_id;
    if (filters.category_key) conditions.category_key = filters.category_key;
    if (filters.period_type) conditions.period_type = filters.period_type;
    if (filters.is_active !== undefined) conditions.is_active = filters.is_active;
    if (filters.amount_min) {
      conditions.amount = { operator: '>=', value: filters.amount_min };
    }
    if (filters.amount_max) {
      conditions.amount = { operator: '<=', value: filters.amount_max };
    }
    if (filters.start_date_from) {
      conditions.start_date = { operator: '>=', value: filters.start_date_from };
    }
    if (filters.start_date_to) {
      conditions.start_date = { operator: '<=', value: filters.start_date_to };
    }

    const [budgets, total] = await Promise.all([
      super.findMany<BudgetRecord>(this.tableName, conditions, '*', orderBy, limit, offset),
      this.count(this.tableName, conditions)
    ]);

    return { budgets, total };
  }

  /**
   * 활성 예산을 조회합니다
   */
  async findActiveBudgets(userId: number): Promise<BudgetRecord[]> {
    const currentDate = new Date();
    
    return await this.executeRawQuery<BudgetRecord>(`
      SELECT * FROM ${this.tableName}
      WHERE user_id = $1
        AND is_active = true
        AND start_date <= $2
        AND end_date >= $2
      ORDER BY category_key, start_date
    `, [userId, currentDate]).then(result => result.rows);
  }

  /**
   * 특정 카테고리의 활성 예산을 조회합니다
   */
  async findActiveBudgetByCategory(
    userId: number,
    categoryKey: string
  ): Promise<BudgetRecord | null> {
    const currentDate = new Date();
    
    const result = await this.executeRawQuery<BudgetRecord>(`
      SELECT * FROM ${this.tableName}
      WHERE user_id = $1
        AND category_key = $2
        AND is_active = true
        AND start_date <= $3
        AND end_date >= $3
      ORDER BY start_date DESC
      LIMIT 1
    `, [userId, categoryKey, currentDate]);

    return result.rows[0] || null;
  }

  /**
   * 예산 진행 상황을 조회합니다
   */
  async getBudgetProgress(budgetId: number, userId: number): Promise<BudgetProgress | null> {
    const budget = await this.findById(budgetId, userId);
    if (!budget) return null;

    // 해당 기간 동안의 지출 조회
    const spentResult = await this.executeRawQuery<{ total_spent: string }>(`
      SELECT COALESCE(SUM(amount), 0) as total_spent
      FROM ${this.transactionTableName}
      WHERE user_id = $1
        AND category_key = $2
        AND transaction_type = 'expense'
        AND transaction_date >= $3
        AND transaction_date <= $4
    `, [userId, budget.category_key, budget.start_date, budget.end_date]);

    const spentAmount = parseFloat(spentResult.rows[0].total_spent);
    const remainingAmount = budget.amount - spentAmount;
    const percentageUsed = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0;
    
    // 남은 일수 계산
    const now = new Date();
    const endDate = new Date(budget.end_date);
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    // 일일 평균 지출 계산
    const startDate = new Date(budget.start_date);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.max(1, totalDays - daysRemaining);
    const dailyAverageSpending = spentAmount / elapsedDays;
    
    // 예상 총 지출 계산
    const projectedSpending = dailyAverageSpending * totalDays;
    const isOnTrack = projectedSpending <= budget.amount;

    return {
      budget,
      spent_amount: spentAmount,
      remaining_amount: remainingAmount,
      percentage_used: percentageUsed,
      days_remaining: daysRemaining,
      is_exceeded: spentAmount > budget.amount,
      daily_average_spending: dailyAverageSpending,
      projected_spending: projectedSpending,
      is_on_track: isOnTrack
    };
  }

  /**
   * 모든 활성 예산의 진행 상황을 조회합니다
   */
  async getAllBudgetProgress(userId: number): Promise<BudgetProgress[]> {
    const activeBudgets = await this.findActiveBudgets(userId);
    const progressList: BudgetProgress[] = [];

    for (const budget of activeBudgets) {
      const progress = await this.getBudgetProgress(budget.id, userId);
      if (progress) {
        progressList.push(progress);
      }
    }

    return progressList;
  }

  /**
   * 예산 요약 정보를 조회합니다
   */
  async getBudgetSummary(userId: number): Promise<BudgetSummary> {
    const activeBudgets = await this.findActiveBudgets(userId);
    const progressList = await this.getAllBudgetProgress(userId);

    const totalBudgets = activeBudgets.length;
    const totalBudgetAmount = activeBudgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = progressList.reduce((sum, progress) => sum + progress.spent_amount, 0);
    const totalRemaining = totalBudgetAmount - totalSpent;
    const exceededBudgets = progressList.filter(p => p.is_exceeded).length;
    const onTrackBudgets = progressList.filter(p => p.is_on_track).length;
    const averageUtilization = progressList.length > 0 
      ? progressList.reduce((sum, p) => sum + p.percentage_used, 0) / progressList.length 
      : 0;

    return {
      total_budgets: totalBudgets,
      active_budgets: totalBudgets,
      total_budget_amount: totalBudgetAmount,
      total_spent: totalSpent,
      total_remaining: totalRemaining,
      exceeded_budgets: exceededBudgets,
      on_track_budgets: onTrackBudgets,
      average_utilization: averageUtilization
    };
  }

  /**
   * 예산 알림을 조회합니다
   */
  async getBudgetAlerts(userId: number): Promise<BudgetAlert[]> {
    const progressList = await this.getAllBudgetProgress(userId);
    const alerts: BudgetAlert[] = [];

    for (const progress of progressList) {
      const { budget, percentage_used, days_remaining, is_exceeded } = progress;

      // 예산 초과
      if (is_exceeded) {
        alerts.push({
          budget_id: budget.id,
          category_key: budget.category_key,
          alert_type: 'exceeded',
          message: `${budget.category_key} 카테고리의 예산이 ${percentage_used.toFixed(1)}% 초과되었습니다.`,
          percentage_used,
          days_remaining
        });
      }
      // 80% 이상 사용
      else if (percentage_used >= 80) {
        alerts.push({
          budget_id: budget.id,
          category_key: budget.category_key,
          alert_type: 'warning',
          message: `${budget.category_key} 카테고리의 예산을 ${percentage_used.toFixed(1)}% 사용했습니다.`,
          percentage_used,
          days_remaining
        });
      }
      
      // 예산 기간 종료 임박 (3일 이하)
      if (days_remaining <= 3 && days_remaining > 0) {
        alerts.push({
          budget_id: budget.id,
          category_key: budget.category_key,
          alert_type: 'near_end',
          message: `${budget.category_key} 카테고리의 예산 기간이 ${days_remaining}일 남았습니다.`,
          percentage_used,
          days_remaining
        });
      }
    }

    return alerts;
  }

  /**
   * 중복 예산을 확인합니다 (같은 카테고리, 겹치는 기간)
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
        AND (
          (start_date <= $3 AND end_date >= $3) OR
          (start_date <= $4 AND end_date >= $4) OR
          (start_date >= $3 AND end_date <= $4)
        )
    `;

    const values: any[] = [userId, categoryKey, startDate, endDate];

    if (excludeId) {
      query += ` AND id != $${values.length + 1}`;
      values.push(excludeId);
    }

    const result = await this.executeRawQuery<BudgetRecord>(query, values);
    return result.rows;
  }

  /**
   * 예산을 비활성화합니다
   */
  async deactivate(id: number, userId: number): Promise<BudgetRecord | null> {
    return await this.updateBudget(id, userId, { is_active: false });
  }

  /**
   * 예산을 활성화합니다
   */
  async activate(id: number, userId: number): Promise<BudgetRecord | null> {
    return await this.updateBudget(id, userId, { is_active: true });
  }

  /**
   * 만료된 예산을 자동으로 비활성화합니다
   */
  async deactivateExpiredBudgets(): Promise<number> {
    const currentDate = new Date();
    
    const result = await this.executeRawQuery(
      `UPDATE ${this.tableName} 
       SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE is_active = true AND end_date < $1`,
      [currentDate]
    );

    return result.rowCount;
  }

  /**
   * 카테고리별 예산 히스토리를 조회합니다
   */
  async getBudgetHistory(
    userId: number,
    categoryKey: string,
    limit: number = 10
  ): Promise<BudgetRecord[]> {
    return await this.executeRawQuery<BudgetRecord>(`
      SELECT * FROM ${this.tableName}
      WHERE user_id = $1 AND category_key = $2
      ORDER BY start_date DESC
      LIMIT $3
    `, [userId, categoryKey, limit]).then(result => result.rows);
  }

  /**
   * 예산 성과 분석을 조회합니다
   */
  async getBudgetPerformance(
    userId: number,
    months: number = 6
  ): Promise<{
    category_key: string;
    total_budget: number;
    total_spent: number;
    success_rate: number;
    average_utilization: number;
    budget_count: number;
  }[]> {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);

    const result = await this.executeRawQuery<{
      category_key: string;
      total_budget: string;
      total_spent: string;
      budget_count: string;
      successful_budgets: string;
    }>(`
      WITH budget_performance AS (
        SELECT 
          b.category_key,
          b.amount as budget_amount,
          COALESCE(t.spent_amount, 0) as spent_amount,
          CASE WHEN COALESCE(t.spent_amount, 0) <= b.amount THEN 1 ELSE 0 END as is_successful
        FROM ${this.tableName} b
        LEFT JOIN (
          SELECT 
            category_key,
            SUM(amount) as spent_amount
          FROM ${this.transactionTableName}
          WHERE user_id = $1
            AND transaction_type = 'expense'
            AND transaction_date >= $2
          GROUP BY category_key
        ) t ON b.category_key = t.category_key
        WHERE b.user_id = $1
          AND b.start_date >= $2
      )
      SELECT 
        category_key,
        SUM(budget_amount) as total_budget,
        SUM(spent_amount) as total_spent,
        COUNT(*) as budget_count,
        SUM(is_successful) as successful_budgets
      FROM budget_performance
      GROUP BY category_key
      ORDER BY total_budget DESC
    `, [userId, cutoffDate]);

    return result.rows.map(row => ({
      category_key: row.category_key,
      total_budget: parseFloat(row.total_budget),
      total_spent: parseFloat(row.total_spent),
      success_rate: parseInt(row.budget_count) > 0 
        ? (parseInt(row.successful_budgets) / parseInt(row.budget_count)) * 100 
        : 0,
      average_utilization: parseFloat(row.total_budget) > 0 
        ? (parseFloat(row.total_spent) / parseFloat(row.total_budget)) * 100 
        : 0,
      budget_count: parseInt(row.budget_count)
    }));
  }

  /**
   * 사용자의 모든 예산을 삭제합니다 (계정 삭제 시 사용)
   */
  async deleteAllByUser(userId: number): Promise<number> {
    const result = await this.executeRawQuery(
      `DELETE FROM ${this.tableName} WHERE user_id = $1`,
      [userId]
    );
    return result.rowCount;
  }
}
