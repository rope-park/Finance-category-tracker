import { BaseRepository } from '../../shared/repositories/BaseRepository';

export interface TransactionRecord {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  amount: number;
  description: string | null;
  transaction_date: Date;
  type: 'income' | 'expense' | 'transfer';
  status: 'pending' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTransactionData {
  user_id: string;
  account_id: string;
  category_id?: string;
  amount: number;
  description?: string;
  transaction_date: Date;
  type: 'income' | 'expense' | 'transfer';
  status?: 'pending' | 'completed' | 'cancelled';
  notes?: string;
}

export interface UpdateTransactionData {
  account_id?: string;
  category_id?: string;
  amount?: number;
  description?: string;
  transaction_date?: Date;
  type?: 'income' | 'expense' | 'transfer';
  status?: 'pending' | 'completed' | 'cancelled';
  notes?: string;
}

export interface TransactionFilters {
  user_id?: string;
  account_id?: string;
  category_id?: string;
  type?: 'income' | 'expense' | 'transfer';
  status?: 'pending' | 'completed' | 'cancelled';
  amount_min?: number;
  amount_max?: number;
  start_date?: Date;
  end_date?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TransactionStatistics {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
  avgTransactionAmount: number;
  topCategory: string | null;
  topCategoryAmount: number;
}

export interface CategorySummary {
  category_key: string;
  transaction_type: 'income' | 'expense';
  total_amount: number;
  transaction_count: number;
  avg_amount: number;
  percentage: number;
}

export interface MonthlyTrend {
  year: number;
  month: number;
  total_income: number;
  total_expenses: number;
  net_amount: number;
  transaction_count: number;
}

export class TransactionRepository extends BaseRepository {
  private readonly tableName = 'transactions';

  /**
   * 거래를 생성합니다
   */
  async createTransaction(transactionData: CreateTransactionData): Promise<TransactionRecord> {
    return await super.create<TransactionRecord>(
      this.tableName,
      transactionData
    );
  }

  /**
   * ID로 거래를 조회합니다
   */
  async findById(id: string, userId: string): Promise<TransactionRecord | null> {
    return await this.findOne<TransactionRecord>(
      this.tableName,
      { id, user_id: userId }
    );
  }

  /**
   * 거래를 업데이트합니다
   */
  async updateTransaction(id: string, userId: string, data: UpdateTransactionData): Promise<TransactionRecord | null> {
    return await super.update<TransactionRecord>(
      this.tableName,
      data,
      { id, user_id: userId }
    );
  }

  /**
   * 거래를 삭제합니다
   */
  async deleteTransaction(id: string, userId: string): Promise<boolean> {
    return await super.delete(this.tableName, { id, user_id: userId });
  }

  /**
   * 필터와 페이지네이션으로 거래 목록을 조회합니다
   */
  async findWithFilters(
    filters: TransactionFilters,
    limit: number = 50,
    offset: number = 0,
    orderBy: string = 'transaction_date DESC, created_at DESC'
  ): Promise<{
    transactions: TransactionRecord[];
    total: number;
  }> {
    const conditions: Record<string, any> = {};

    // 필터 조건 구성
    if (filters.user_id) conditions.user_id = filters.user_id;
    if (filters.account_id) conditions.account_id = filters.account_id;
    if (filters.category_id) conditions.category_id = filters.category_id;
    if (filters.type) conditions.type = filters.type;
    if (filters.status) conditions.status = filters.status;
    if (filters.amount_min) {
      conditions.amount = { operator: '>=', value: filters.amount_min };
    }
    if (filters.amount_max) {
      conditions.amount = { operator: '<=', value: filters.amount_max };
    }
    if (filters.start_date) {
      conditions.transaction_date = { operator: '>=', value: filters.start_date };
    }
    if (filters.end_date) {
      conditions.transaction_date = { operator: '<=', value: filters.end_date };
    }

    let whereClause = '';
    let values: any[] = [];

    // 동적 WHERE 절 구성
    const { whereClause: baseWhere, values: baseValues } = this.buildWhereClause(conditions);
    whereClause = baseWhere;
    values = [...baseValues];

    // 설명 검색 (LIKE 조건)
    if (filters.search) {
      if (whereClause) {
        whereClause += ' AND ';
      } else {
        whereClause = 'WHERE ';
      }
      whereClause += `description ILIKE $${values.length + 1}`;
      values.push(`%${filters.search}%`);
    }

    const [transactions, total] = await Promise.all([
      this.executeRawQuery<TransactionRecord>(
        `SELECT * FROM ${this.tableName} ${whereClause} ORDER BY ${orderBy} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
        [...values, limit, offset]
      ).then(result => result.rows),
      
      this.executeRawQuery<{ count: string }>(
        `SELECT COUNT(*) as count FROM ${this.tableName} ${whereClause}`,
        values
      ).then(result => parseInt(result.rows[0].count))
    ]);

    return { transactions, total };
  }

  /**
   * 사용자의 거래 통계를 조회합니다
   */
  async getStatistics(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<TransactionStatistics> {
    let whereClause = 'WHERE user_id = $1';
    const values: any[] = [userId];

    if (startDate) {
      whereClause += ` AND transaction_date >= $${values.length + 1}`;
      values.push(startDate);
    }

    if (endDate) {
      whereClause += ` AND transaction_date <= $${values.length + 1}`;
      values.push(endDate);
    }

    const [statsResult, topCategoryResult] = await Promise.all([
      // 기본 통계
      this.executeRawQuery<{
        total_income: string;
        total_expenses: string;
        transaction_count: string;
        avg_amount: string;
      }>(`
        SELECT 
          COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
          COUNT(*) as transaction_count,
          COALESCE(AVG(amount), 0) as avg_amount
        FROM ${this.tableName}
        ${whereClause}
      `, values),

      // 상위 카테고리
      this.executeRawQuery<{
        category_key: string;
        total_amount: string;
      }>(`
        SELECT 
          category_key,
          SUM(amount) as total_amount
        FROM ${this.tableName}
        ${whereClause}
        GROUP BY category_key
        ORDER BY total_amount DESC
        LIMIT 1
      `, values)
    ]);

    const stats = statsResult.rows[0];
    const topCategory = topCategoryResult.rows[0];

    const totalIncome = parseFloat(stats.total_income || '0');
    const totalExpenses = parseFloat(stats.total_expenses || '0');

    return {
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
      transactionCount: parseInt(stats.transaction_count || '0'),
      avgTransactionAmount: parseFloat(stats.avg_amount || '0'),
      topCategory: topCategory?.category_key || null,
      topCategoryAmount: parseFloat(topCategory?.total_amount || '0')
    };
  }

  /**
   * 카테고리별 요약을 조회합니다
   */
  async getCategorySummary(
    userId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<CategorySummary[]> {
    let whereClause = 'WHERE user_id = $1';
    const values: any[] = [userId];

    if (startDate) {
      whereClause += ` AND transaction_date >= $${values.length + 1}`;
      values.push(startDate);
    }

    if (endDate) {
      whereClause += ` AND transaction_date <= $${values.length + 1}`;
      values.push(endDate);
    }

    const result = await this.executeRawQuery<{
      category_key: string;
      transaction_type: 'income' | 'expense';
      total_amount: string;
      transaction_count: string;
      avg_amount: string;
    }>(`
      SELECT 
        category_key,
        transaction_type,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count,
        AVG(amount) as avg_amount
      FROM ${this.tableName}
      ${whereClause}
      GROUP BY category_key, transaction_type
      ORDER BY total_amount DESC
    `, values);

    // 전체 금액 계산 (퍼센트 계산용)
    const totalAmount = result.rows.reduce((sum, row) => sum + parseFloat(row.total_amount), 0);

    return result.rows.map(row => ({
      category_key: row.category_key,
      transaction_type: row.transaction_type,
      total_amount: parseFloat(row.total_amount),
      transaction_count: parseInt(row.transaction_count),
      avg_amount: parseFloat(row.avg_amount),
      percentage: totalAmount > 0 ? (parseFloat(row.total_amount) / totalAmount) * 100 : 0
    }));
  }

  /**
   * 월별 트렌드를 조회합니다
   */
  async getMonthlyTrend(
    userId: number,
    months: number = 12
  ): Promise<MonthlyTrend[]> {
    const result = await this.executeRawQuery<{
      year: string;
      month: string;
      total_income: string;
      total_expenses: string;
      transaction_count: string;
    }>(`
      SELECT 
        EXTRACT(YEAR FROM transaction_date) as year,
        EXTRACT(MONTH FROM transaction_date) as month,
        COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
        COUNT(*) as transaction_count
      FROM ${this.tableName}
      WHERE user_id = $1
        AND transaction_date >= CURRENT_DATE - INTERVAL '${months} months'
      GROUP BY 
        EXTRACT(YEAR FROM transaction_date),
        EXTRACT(MONTH FROM transaction_date)
      ORDER BY year DESC, month DESC
    `, [userId]);

    return result.rows.map(row => ({
      year: parseInt(row.year),
      month: parseInt(row.month),
      total_income: parseFloat(row.total_income),
      total_expenses: parseFloat(row.total_expenses),
      net_amount: parseFloat(row.total_income) - parseFloat(row.total_expenses),
      transaction_count: parseInt(row.transaction_count)
    }));
  }

  /**
   * 일별 지출 평균을 계산합니다
   */
  async getDailyAverageSpending(
    userId: number,
    days: number = 30
  ): Promise<number> {
    const result = await this.executeRawQuery<{ avg_daily_spending: string }>(`
      SELECT 
        COALESCE(
          SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) / 
          GREATEST(EXTRACT(DAY FROM (MAX(transaction_date) - MIN(transaction_date))) + 1, 1),
          0
        ) as avg_daily_spending
      FROM ${this.tableName}
      WHERE user_id = $1
        AND transaction_date >= CURRENT_DATE - INTERVAL '${days} days'
    `, [userId]);

    return parseFloat(result.rows[0]?.avg_daily_spending || '0');
  }

  /**
   * 특정 카테고리의 거래를 조회합니다
   */
  async findByCategory(
    userId: string,
    categoryId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    transactions: TransactionRecord[];
    total: number;
  }> {
    return await this.findWithFilters(
      { user_id: userId, category_id: categoryId },
      limit,
      offset
    );
  }

  /**
   * 중복 거래를 확인합니다 (같은 날짜, 같은 금액, 같은 설명)
   */
  async findDuplicates(
    userId: string,
    amount: number,
    description: string,
    transactionDate: Date,
    excludeId?: string
  ): Promise<TransactionRecord[]> {
    const conditions: Record<string, any> = {
      user_id: userId,
      amount,
      description,
      transaction_date: transactionDate
    };

    if (excludeId) {
      conditions.id = { operator: '!=', value: excludeId };
    }

    return await super.findMany<TransactionRecord>(
      this.tableName,
      conditions
    );
  }

  /**
   * 거래 데이터를 일괄 생성합니다 (CSV 임포트 등에 사용)
   */
  async bulkCreate(transactions: CreateTransactionData[]): Promise<TransactionRecord[]> {
    return await this.executeTransaction(async (client) => {
      const results: TransactionRecord[] = [];

      for (const transaction of transactions) {
        const result = await client.query(
          `INSERT INTO ${this.tableName} 
           (user_id, account_id, category_id, type, amount, description, transaction_date, status, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING *`,
          [
            transaction.user_id,
            transaction.account_id,
            transaction.category_id,
            transaction.type,
            transaction.amount,
            transaction.description,
            transaction.transaction_date,
            transaction.status || 'completed',
            transaction.notes
          ]
        );
        results.push(result.rows[0]);
      }

      return results;
    });
  }

  /**
   * 사용자의 모든 거래를 삭제합니다 (계정 삭제 시 사용)
   */
  async deleteAllByUser(userId: number): Promise<number> {
    const result = await this.executeRawQuery(
      `DELETE FROM ${this.tableName} WHERE user_id = $1`,
      [userId]
    );
    return result.rowCount;
  }
}
