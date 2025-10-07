/**
 * 거래 데이터 접근 레이어 (Repository)
 * 
 * 사용자의 모든 금융 거래 데이터에 대한 데이터 접근 계층.
 * 거래 생성, 조회, 수정, 삭제 및 복잡한 필터링 쿼리 담당.
 * 
 * 주요 기능:
 * - 거래 CRUD 작업 및 데이터 무결성 보장
 * - 다양한 필터 조건으로 거래 검색 및 정렬
 * - 페이지네이션과 성능 최적화된 쿼리
 * - 거래 통계 및 집계 데이터 생성
 * 
 * @author Ju Eul Park (rope-park)
 */

import { BaseRepository } from '../../shared/repositories/BaseRepository';

/**
 * 거래 레코드 인터페이스
 */
export interface TransactionRecord {
  id: string;                                              // 고유 거래 식별자
  user_id: number;                                         // 거래 소유자 ID
  account_id: string;                                      // 거래가 발생한 계좌 ID
  category_id: number | null;                              // 거래 카테고리 ID (선택사항)
  amount: number;                                          // 거래 금액
  description: string | null;                              // 거래 설명 (선택사항)
  transaction_date: Date;                                  // 거래 발생 날짜
  type: 'income' | 'expense' | 'transfer';                 // 거래 유형 (수입/지출/이체)
  status: 'pending' | 'completed' | 'cancelled';           // 거래 상태
  notes: string | null;                                    // 추가 메모 (선택사항)
  created_at: Date;                                        // 레코드 생성 시간
  updated_at: Date;                                        // 마지막 수정 시간
}

/**
 * 새로운 거래 생성에 필요한 데이터 인터페이스
 */
export interface CreateTransactionData {
  user_id: number;                                         // 거래를 등록하는 사용자 ID
  account_id: number;                                      // 거래가 발생할 계좌 ID
  category_id?: number;                                    // 거래 카테고리 ID (선택사항)
  amount: number;                                          // 거래 금액 (양수)
  description?: string;                                    // 거래 설명 (선택사항)
  transaction_date: Date;                                  // 거래 발생 날짜
  type: 'income' | 'expense' | 'transfer';                 // 거래 유형
  status?: 'pending' | 'completed' | 'cancelled';
  notes?: string;
}

/**
 * 거래 업데이트에 필요한 데이터 인터페이스
 */
export interface UpdateTransactionData {
  account_id?: string;
  category_id?: number;
  amount?: number;
  description?: string;
  transaction_date?: Date;
  type?: 'income' | 'expense' | 'transfer';
  status?: 'pending' | 'completed' | 'cancelled';
  notes?: string;
}

/**
 * 거래 필터링 조건 인터페이스
 * 
 * 거래 조회 시 사용할 수 있는 다양한 필터 옵션을 정의.
 * 각 필드는 선택사항이며, 조합하여 복잡한 쿼리 생성 가능.
 */
export interface TransactionFilters {
  user_id?: number;
  account_id?: string;
  category_id?: number;
  type?: 'income' | 'expense' | 'transfer';
  status?: 'pending' | 'completed' | 'cancelled';
  amount_min?: number;
  amount_max?: number;
  start_date?: Date;
  end_date?: Date;
  search?: string;
  page?: number;    // 페이지네이션용 (1부터 시작)
  limit?: number;   // 페이지당 항목 수
}

/**
 * 거래 통계 인터페이스
 * 
 * 사용자의 거래 데이터를 기반으로 생성된 다양한 통계 정보를 포함.
 * 대시보드 및 보고서에 활용 가능.
 */
export interface TransactionStatistics {
  totalIncome: number;  // 총 수입
  totalExpenses: number; // 총 지출
  netAmount: number;  // 순수입 (수입 - 지출)
  transactionCount: number;  // 총 거래 건수
  avgTransactionAmount: number; // 평균 거래 금액
  topCategory: string | null; // 가장 많이 사용된 카테고리 키
  topCategoryAmount: number;  // 가장 많이 사용된 카테고리의 총 금액
}

/**
 * 카테고리별 요약 인터페이스
 */
export interface CategorySummary {
  category_key: string;
  transaction_type: 'income' | 'expense';
  total_amount: number;
  transaction_count: number;
  avg_amount: number;
  percentage: number;
}

/**
 * 월별 트렌드 인터페이스
 */
export interface MonthlyTrend {
  year: number;
  month: number;
  total_income: number;
  total_expenses: number;
  net_amount: number;
  transaction_count: number;
}

/**
 * TransactionRepository 클래스
 * 
 * transactions 테이블에 대한 모든 데이터베이스 작업을 처리.
 */
export class TransactionRepository extends BaseRepository {
  private readonly tableName = 'transactions';

  /**
   * 거래 생성
   * @param transactionData - 생성할 거래 데이터
   * @return 생성된 거래 객체
   */
  async createTransaction(transactionData: CreateTransactionData): Promise<TransactionRecord> {
    return await super.create<TransactionRecord>(
      this.tableName,
      transactionData
    );
  }

  /**
   * ID로 거래 조회
   * @param id - 조회할 거래 ID
   * @return 거래 객체 또는 null (없을 경우)
   */
  async findById(id: string, userId: string): Promise<TransactionRecord | null> {
    return await this.findOne<TransactionRecord>(
      this.tableName,
      { id, user_id: userId }
    );
  }

  /**
   * 거래 업데이트
   * @param id - 업데이트할 거래 ID
   * @return 업데이트된 거래 객체 또는 null (없을 경우)
   */
  async updateTransaction(id: string, userId: string, data: UpdateTransactionData): Promise<TransactionRecord | null> {
    return await super.update<TransactionRecord>(
      this.tableName,
      data,
      { id, user_id: userId }
    );
  }

  /**
   * 거래 삭제
   * @param id - 삭제할 거래 ID
   * @return 삭제 성공 여부
   */
  async deleteTransaction(id: string, userId: string): Promise<boolean> {
    return await super.delete(this.tableName, { id, user_id: userId });
  }

  /**
   * 필터와 페이지네이션으로 거래 목록 조회
   * @param filters - 다양한 필터 조건
   * @param limit - 페이지당 항목 수 (기본값 50)
   * @param offset - 페이지 오프셋 (기본값 0)
   * @param orderBy - 정렬 기준 (기본값 'transaction_date DESC, created_at DESC')
   * @return 거래 목록과 전체 개수
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
   * 사용자의 거래 통계 조회
   * @param userId - 사용자 ID
   * @param startDate - 시작일 (선택사항)
   * @param endDate - 종료일 (선택사항)
   * @return 거래 통계 객체
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
   * 카테고리별 요약 조회
   * @param userId - 사용자 ID
   * @param startDate - 시작일 (선택사항)
   * @param endDate - 종료일 (선택사항)
   * @return 카테고리별 요약 목록
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
   * 월별 트렌드 조회
   * @param userId - 사용자 ID
   * @param months - 조회할 개월 수 (기본값 12개월)
   * @return 월별 트렌드 목록
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
   * 일별 지출 평균 조회
   * @param userId - 사용자 ID
   * @param days - 조회할 일수 (기본값 30일)
   * @return 일별 평균 지출 금액
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
   * 특정 카테고리의 거래 조회
   * @param userId - 사용자 ID
   * @param categoryId - 카테고리 ID
   * @param limit - 페이지당 항목 수 (기본값 50)
   * @param offset - 페이지 오프셋 (기본값 0)
   * @return 거래 목록과 전체 개수
   */
  async findByCategory(
    userId: number,
    categoryId: number,
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
   * 중복 거래 확인 (같은 날짜, 같은 금액, 같은 설명)
   * @param userId - 사용자 ID
   * @param amount - 거래 금액
   * @param description - 거래 설명
   * @param transactionDate - 거래 날짜
   * @param excludeId - 제외할 거래 ID (업데이트 시 자기 자신 제외용)
   * @return 중복 거래 목록
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
   * 거래 데이터 일괄 생성 (CSV 임포트 등에 사용)
   * @param transactions - 생성할 거래 데이터 배열
   * @return 생성된 거래 객체 배열
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
   * 사용자의 모든 거래 삭제 (계정 삭제 시 사용)
   * @param userId - 사용자 ID
   * @return 삭제된 거래 건수
   */
  async deleteAllByUser(userId: number): Promise<number> {
    const result = await this.executeRawQuery(
      `DELETE FROM ${this.tableName} WHERE user_id = $1`,
      [userId]
    );
    return result.rowCount;
  }
}
