import { BaseRepository } from '../../shared/repositories/BaseRepository';

// 교육 콘텐츠 인터페이스
export interface EducationContent {
  id: number;
  title: string;
  content: string;
  category: string;
  difficulty_level: string;
  content_type: string;
  reading_time_minutes: number;
  tags: string[];
  author: string;
  published_date: Date;
  updated_date: Date;
  is_featured: boolean;
  view_count: number;
  like_count: number;
  created_at: Date;
}

// 사용자 교육 진행 상황
export interface UserEducationProgress {
  id: number;
  user_id: number;
  content_id: number;
  is_completed: boolean;
  completion_date?: Date;
  reading_progress: number;
  quiz_score?: number;
  time_spent_minutes: number;
  bookmarked: boolean;
  rating?: number;
  created_at: Date;
  updated_at: Date;
}

// 재정 건강도 점수
export interface FinancialHealthScore {
  id: number;
  user_id: number;
  overall_score: number;
  budgeting_score: number;
  saving_score: number;
  debt_score: number;
  investment_score: number;
  emergency_fund_score: number;
  calculation_date: Date;
  factors_analysis: any;
  recommendations: string[];
  created_at: Date;
}

// 절약 팁
export interface SavingTip {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimated_savings_amount?: number;
  estimated_savings_percentage?: number;
  applicable_to: string[];
  seasonal: boolean;
  tags: string[];
  source_url?: string;
  is_active: boolean;
  created_at: Date;
}

// 개인화된 조언
export interface PersonalizedAdvice {
  id: number;
  user_id: number;
  advice_type: string;
  title: string;
  content: string;
  priority: string;
  based_on: any;
  is_read: boolean;
  is_dismissed: boolean;
  expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export class EducationRepository extends BaseRepository {
  private readonly contentTable = 'financial_education_content';
  private readonly progressTable = 'user_education_progress';
  private readonly healthTable = 'user_financial_health_scores';
  private readonly tipsTable = 'saving_tips';
  private readonly adviceTable = 'personalized_advice';
  private readonly interactionTable = 'user_saving_tips_interaction';

  // 교육 콘텐츠 관련 메소드
  async getAllContent(category?: string, difficulty?: string, limit = 20, offset = 0): Promise<EducationContent[]> {
    let query = `SELECT * FROM ${this.contentTable} WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (difficulty) {
      query += ` AND difficulty_level = $${paramIndex}`;
      params.push(difficulty);
      paramIndex++;
    }

    query += ` ORDER BY is_featured DESC, published_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await this.executeRawQuery(query, params);
    return result.rows.map(this.mapRowToContent);
  }

  async getContentById(id: number): Promise<EducationContent | null> {
    const result = await this.executeRawQuery(
      `SELECT * FROM ${this.contentTable} WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) return null;

    // 조회수 증가
    await this.executeRawQuery(
      `UPDATE ${this.contentTable} SET view_count = view_count + 1 WHERE id = $1`,
      [id]
    );

    return this.mapRowToContent(result.rows[0]);
  }

  async getFeaturedContent(limit = 5): Promise<EducationContent[]> {
    const result = await this.executeRawQuery(
      `SELECT * FROM ${this.contentTable} WHERE is_featured = true ORDER BY published_date DESC LIMIT $1`,
      [limit]
    );
    return result.rows.map(this.mapRowToContent);
  }

  async searchContent(searchTerm: string, limit = 20): Promise<EducationContent[]> {
    const result = await this.executeRawQuery(`
      SELECT * FROM ${this.contentTable} 
      WHERE to_tsvector('korean', title || ' ' || content) @@ plainto_tsquery('korean', $1)
         OR title ILIKE $2 
         OR $3 = ANY(tags)
      ORDER BY view_count DESC, published_date DESC 
      LIMIT $4
    `, [searchTerm, `%${searchTerm}%`, searchTerm, limit]);
    
    return result.rows.map(this.mapRowToContent);
  }

  // 사용자 진행 상황 관련 메소드
  async getUserProgress(userId: number, contentId?: number): Promise<UserEducationProgress[]> {
    let query = `SELECT * FROM ${this.progressTable} WHERE user_id = $1`;
    const params: any[] = [userId];

    if (contentId) {
      query += ` AND content_id = $2`;
      params.push(contentId);
    }

    query += ` ORDER BY updated_at DESC`;

    const result = await this.executeRawQuery(query, params);
    return result.rows.map(this.mapRowToProgress);
  }

  async updateProgress(
    userId: number, 
    contentId: number, 
    progressData: Partial<UserEducationProgress>
  ): Promise<UserEducationProgress> {
    const existingProgress = await this.executeRawQuery(
      `SELECT * FROM ${this.progressTable} WHERE user_id = $1 AND content_id = $2`,
      [userId, contentId]
    );

    if (existingProgress.rows.length > 0) {
      // 업데이트
      const setFields = Object.keys(progressData)
        .filter(key => key !== 'id' && key !== 'user_id' && key !== 'content_id' && key !== 'created_at')
        .map((key, index) => `${key} = $${index + 3}`)
        .join(', ');

      const values = Object.values(progressData).filter((_, index) => {
        const key = Object.keys(progressData)[index];
        return key !== 'id' && key !== 'user_id' && key !== 'content_id' && key !== 'created_at';
      });

      const result = await this.executeRawQuery(`
        UPDATE ${this.progressTable} 
        SET ${setFields}, updated_at = CURRENT_TIMESTAMP 
        WHERE user_id = $1 AND content_id = $2 
        RETURNING *
      `, [userId, contentId, ...values]);

      return this.mapRowToProgress(result.rows[0]);
    } else {
      // 새로 생성
      const result = await this.executeRawQuery(`
        INSERT INTO ${this.progressTable} (user_id, content_id, reading_progress, time_spent_minutes, bookmarked)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [
        userId, 
        contentId, 
        progressData.reading_progress || 0,
        progressData.time_spent_minutes || 0,
        progressData.bookmarked || false
      ]);

      return this.mapRowToProgress(result.rows[0]);
    }
  }

  // 재정 건강도 점수 관련 메소드
  async calculateHealthScore(userId: number): Promise<FinancialHealthScore> {
    // 사용자의 거래 데이터를 기반으로 건강도 점수 계산
    const transactionData = await this.executeRawQuery(`
      SELECT 
        SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) as total_expense,
        COUNT(CASE WHEN transaction_type = 'expense' AND category_key LIKE '%saving%' THEN 1 END) as saving_transactions,
        COUNT(*) as total_transactions
      FROM transactions 
      WHERE user_id = $1 AND transaction_date >= CURRENT_DATE - INTERVAL '3 months'
    `, [userId]);

    const budgetData = await this.executeRawQuery(`
      SELECT COUNT(*) as active_budgets, AVG(amount) as avg_budget
      FROM budgets 
      WHERE user_id = $1 AND is_active = true
    `, [userId]);

    const data = transactionData.rows[0];
    const budget = budgetData.rows[0];

    // 점수 계산 로직
    const totalIncome = parseFloat((data as any).total_income || '0');
    const totalExpense = parseFloat((data as any).total_expense || '0');
    const savingTransactions = parseInt((data as any).saving_transactions || '0');
    const activeBudgets = parseInt((budget as any).active_budgets || '0');

    // 예산 관리 점수 (0-100)
    const budgetingScore = Math.min(100, activeBudgets * 25); // 예산이 4개 이상이면 만점

    // 저축 점수 (0-100)
    const savingScore = totalIncome > 0 
      ? Math.min(100, (savingTransactions / Math.max(1, totalIncome / 1000)) * 20)
      : 0;

    // 부채 점수 (임시로 80점)
    const debtScore = 80;

    // 투자 점수 (임시로 60점)
    const investmentScore = 60;

    // 비상 자금 점수 (임시로 70점)
    const emergencyFundScore = 70;

    // 전체 점수
    const overallScore = Math.round(
      (budgetingScore + savingScore + debtScore + investmentScore + emergencyFundScore) / 5
    );

    // 분석 및 권장사항
    const factorsAnalysis = {
      income_expense_ratio: totalIncome > 0 ? totalExpense / totalIncome : 0,
      budget_utilization: activeBudgets > 0 ? 'good' : 'needs_improvement',
      saving_frequency: savingTransactions > 5 ? 'excellent' : 'needs_improvement'
    };

    const recommendations = [];
    if (budgetingScore < 50) recommendations.push('더 많은 카테고리에 예산을 설정해보세요');
    if (savingScore < 50) recommendations.push('정기적인 저축 습관을 만들어보세요');
    if (overallScore < 60) recommendations.push('금융 교육 콘텐츠를 통해 지식을 늘려보세요');

    // 데이터베이스에 저장
    const result = await this.executeRawQuery(`
      INSERT INTO ${this.healthTable} 
      (user_id, overall_score, budgeting_score, saving_score, debt_score, investment_score, emergency_fund_score, factors_analysis, recommendations)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      userId, overallScore, budgetingScore, savingScore, debtScore, 
      investmentScore, emergencyFundScore, JSON.stringify(factorsAnalysis), recommendations
    ]);

    return this.mapRowToHealthScore(result.rows[0]);
  }

  async getLatestHealthScore(userId: number): Promise<FinancialHealthScore | null> {
    const result = await this.executeRawQuery(
      `SELECT * FROM ${this.healthTable} WHERE user_id = $1 ORDER BY calculation_date DESC LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) return null;
    return this.mapRowToHealthScore(result.rows[0]);
  }

  // 절약 팁 관련 메소드
  async getSavingTips(category?: string, difficulty?: string, limit = 10): Promise<SavingTip[]> {
    let query = `SELECT * FROM ${this.tipsTable} WHERE is_active = true`;
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (difficulty) {
      query += ` AND difficulty = $${paramIndex}`;
      params.push(difficulty);
      paramIndex++;
    }

    query += ` ORDER BY estimated_savings_percentage DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await this.executeRawQuery(query, params);
    return result.rows.map(this.mapRowToTip);
  }

  async getPersonalizedTips(userId: number): Promise<SavingTip[]> {
    // 사용자의 소비 패턴을 분석하여 맞춤형 팁 제공
    const userExpenseCategories = await this.executeRawQuery(`
      SELECT category_key, SUM(amount) as total_amount 
      FROM transactions 
      WHERE user_id = $1 AND transaction_type = 'expense' 
        AND transaction_date >= CURRENT_DATE - INTERVAL '1 month'
      GROUP BY category_key 
      ORDER BY total_amount DESC 
      LIMIT 3
    `, [userId]);

    if (userExpenseCategories.rows.length === 0) {
      return this.getSavingTips();
    }

    // 주요 지출 카테고리에 맞는 팁 조회
    const categories = userExpenseCategories.rows.map((row: any) => {
      const category = row.category_key;
      if (category.includes('food') || category.includes('식비')) return 'food';
      if (category.includes('transport') || category.includes('교통')) return 'transport';
      if (category.includes('entertainment') || category.includes('여가')) return 'entertainment';
      return 'general';
    });

    const result = await this.executeRawQuery(`
      SELECT * FROM ${this.tipsTable} 
      WHERE is_active = true AND category = ANY($1)
      ORDER BY estimated_savings_percentage DESC 
      LIMIT 5
    `, [categories]);

    return result.rows.map(this.mapRowToTip);
  }

  // 개인화된 조언 관련 메소드
  async generatePersonalizedAdvice(userId: number): Promise<PersonalizedAdvice[]> {
    const adviceList: any[] = [];

    // 최근 지출 패턴 분석
    const recentExpenses = await this.executeRawQuery(`
      SELECT SUM(amount) as total, COUNT(*) as count
      FROM transactions 
      WHERE user_id = $1 AND transaction_type = 'expense' 
        AND transaction_date >= CURRENT_DATE - INTERVAL '1 month'
    `, [userId]);

    const expense = recentExpenses.rows[0];
    if (parseFloat((expense as any).total || '0') > 1000000) { // 100만원 이상
      adviceList.push({
        advice_type: 'budgeting',
        title: '지출 관리 개선 필요',
        content: '최근 한 달간 지출이 많았습니다. 예산을 세워 지출을 체계적으로 관리해보세요.',
        priority: 'high',
        based_on: { monthly_expense: (expense as any).total }
      });
    }

    // 예산 설정 여부 확인
    const budgetCount = await this.executeRawQuery(`
      SELECT COUNT(*) as count FROM budgets WHERE user_id = $1 AND is_active = true
    `, [userId]);

    if (parseInt((budgetCount.rows[0] as any).count) === 0) {
      adviceList.push({
        advice_type: 'budgeting',
        title: '예산 설정 권장',
        content: '아직 예산을 설정하지 않으셨네요. 카테고리별 예산을 설정하여 지출을 효과적으로 관리해보세요.',
        priority: 'medium',
        based_on: { has_budget: false }
      });
    }

    // 데이터베이스에 저장
    for (const advice of adviceList) {
      await this.executeRawQuery(`
        INSERT INTO ${this.adviceTable} 
        (user_id, advice_type, title, content, priority, based_on, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        userId, advice.advice_type, advice.title, advice.content, 
        advice.priority, JSON.stringify(advice.based_on),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7일 후 만료
      ]);
    }

    return this.getPersonalizedAdvice(userId);
  }

  async getPersonalizedAdvice(userId: number): Promise<PersonalizedAdvice[]> {
    const result = await this.executeRawQuery(`
      SELECT * FROM ${this.adviceTable} 
      WHERE user_id = $1 AND is_dismissed = false 
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      ORDER BY 
        CASE priority 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3 
        END,
        created_at DESC
    `, [userId]);

    return result.rows.map(this.mapRowToAdvice);
  }

  // 매핑 메소드들
  private mapRowToContent(row: any): EducationContent {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      category: row.category,
      difficulty_level: row.difficulty_level,
      content_type: row.content_type,
      reading_time_minutes: row.reading_time_minutes,
      tags: row.tags || [],
      author: row.author,
      published_date: new Date(row.published_date),
      updated_date: new Date(row.updated_date),
      is_featured: row.is_featured,
      view_count: row.view_count,
      like_count: row.like_count,
      created_at: new Date(row.created_at)
    };
  }

  private mapRowToProgress(row: any): UserEducationProgress {
    return {
      id: row.id,
      user_id: row.user_id,
      content_id: row.content_id,
      is_completed: row.is_completed,
      completion_date: row.completion_date ? new Date(row.completion_date) : undefined,
      reading_progress: parseFloat(row.reading_progress),
      quiz_score: row.quiz_score,
      time_spent_minutes: row.time_spent_minutes,
      bookmarked: row.bookmarked,
      rating: row.rating,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }

  private mapRowToHealthScore(row: any): FinancialHealthScore {
    return {
      id: row.id,
      user_id: row.user_id,
      overall_score: row.overall_score,
      budgeting_score: row.budgeting_score,
      saving_score: row.saving_score,
      debt_score: row.debt_score,
      investment_score: row.investment_score,
      emergency_fund_score: row.emergency_fund_score,
      calculation_date: new Date(row.calculation_date),
      factors_analysis: row.factors_analysis,
      recommendations: row.recommendations || [],
      created_at: new Date(row.created_at)
    };
  }

  private mapRowToTip(row: any): SavingTip {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      difficulty: row.difficulty,
      estimated_savings_amount: row.estimated_savings_amount ? parseFloat(row.estimated_savings_amount) : undefined,
      estimated_savings_percentage: row.estimated_savings_percentage ? parseFloat(row.estimated_savings_percentage) : undefined,
      applicable_to: row.applicable_to || [],
      seasonal: row.seasonal,
      tags: row.tags || [],
      source_url: row.source_url,
      is_active: row.is_active,
      created_at: new Date(row.created_at)
    };
  }

  private mapRowToAdvice(row: any): PersonalizedAdvice {
    return {
      id: row.id,
      user_id: row.user_id,
      advice_type: row.advice_type,
      title: row.title,
      content: row.content,
      priority: row.priority,
      based_on: row.based_on,
      is_read: row.is_read,
      is_dismissed: row.is_dismissed,
      expires_at: row.expires_at ? new Date(row.expires_at) : undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }

  // 조언 읽음 처리
  async markAdviceAsRead(userId: number, adviceId: number): Promise<void> {
    await this.executeRawQuery(`
      UPDATE personalized_advice 
      SET is_read = true, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1 AND user_id = $2
    `, [adviceId, userId]);
  }

  // 조언 해제
  async dismissAdvice(userId: number, adviceId: number): Promise<void> {
    await this.executeRawQuery(`
      UPDATE personalized_advice 
      SET is_dismissed = true, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1 AND user_id = $2
    `, [adviceId, userId]);
  }

  // 절약 팁 도움 표시
  async markTipAsHelpful(userId: number, tipId: number, isHelpful: boolean, feedback?: string): Promise<void> {
    await this.executeRawQuery(`
      INSERT INTO user_tip_feedback (user_id, tip_id, is_helpful, feedback, created_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, tip_id) 
      DO UPDATE SET is_helpful = EXCLUDED.is_helpful, feedback = EXCLUDED.feedback, updated_at = CURRENT_TIMESTAMP
    `, [userId, tipId, isHelpful, feedback]);
  }

  // 재정 건강도 점수 이력 조회
  async getHealthScoreHistory(userId: number, limit = 12): Promise<FinancialHealthScore[]> {
    const result = await this.executeRawQuery(`
      SELECT * FROM user_financial_health_scores 
      WHERE user_id = $1 
      ORDER BY calculated_at DESC 
      LIMIT $2
    `, [userId, limit]);

    return result.rows.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      overall_score: row.total_score,
      budgeting_score: row.budgeting_score,
      saving_score: row.saving_score,
      debt_score: row.debt_score,
      investment_score: row.investment_score,
      emergency_fund_score: row.emergency_fund_score,
      calculation_date: row.calculated_at,
      factors_analysis: row.monthly_data,
      recommendations: row.recommendations,
      created_at: row.calculated_at
    }));
  }
}
