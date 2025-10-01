import pool from '../../core/config/database';

export interface FamilyData {
  name: string;
  description?: string;
  currency?: string;
  sharedBudget?: number;
  ownerId: number;
  status: string;
}

export interface FamilyMemberData {
  familyId: number;
  userId: number;
  role: string;
  status: string;
  permissions: any;
  joinedAt?: Date;
}

export interface SharedGoalData {
  familyId: number;
  createdBy: number;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  targetDate: Date;
  status: string;
}

export interface GoalContributionData {
  goalId: number;
  userId: number;
  amount: number;
  note?: string;
}

export interface FamilyTransactionData {
  familyId: number;
  userId: number;
  type: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  splitDetails?: any;
}

export class SocialRepository {
  // 가족 생성
  async createFamily(familyData: FamilyData): Promise<any> {
    const query = `
      INSERT INTO families (name, description, currency, shared_budget, owner_id, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `;
    
    const values = [
      familyData.name,
      familyData.description,
      familyData.currency || 'KRW',
      familyData.sharedBudget,
      familyData.ownerId,
      familyData.status
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 가족 조회
  async findFamilyById(familyId: number): Promise<any> {
    const query = `
      SELECT f.*, u.name as owner_name, u.email as owner_email,
             COUNT(DISTINCT fm.id) as member_count,
             COUNT(DISTINCT sg.id) as goals_count
      FROM families f
      LEFT JOIN users u ON f.owner_id = u.id
      LEFT JOIN family_members fm ON f.id = fm.family_id AND fm.status = 'accepted'
      LEFT JOIN shared_goals sg ON f.id = sg.family_id AND sg.status = 'active'
      WHERE f.id = $1 AND f.status != 'deleted'
      GROUP BY f.id, u.name, u.email
    `;
    
    const result = await pool.query(query, [familyId]);
    return result.rows[0];
  }

  // 사용자 가족 목록
  async findUserFamilies(userId: number): Promise<any[]> {
    const query = `
      SELECT f.*, fm.role, fm.permissions, fm.joined_at,
             u.name as owner_name
      FROM families f
      JOIN family_members fm ON f.id = fm.family_id
      JOIN users u ON f.owner_id = u.id
      WHERE fm.user_id = $1 AND fm.status = 'accepted' AND f.status = 'active'
      ORDER BY fm.joined_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // 가족 멤버 생성
  async createFamilyMember(memberData: FamilyMemberData): Promise<any> {
    const query = `
      INSERT INTO family_members (family_id, user_id, role, status, permissions, joined_at, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `;
    
    const values = [
      memberData.familyId,
      memberData.userId,
      memberData.role,
      memberData.status,
      JSON.stringify(memberData.permissions),
      memberData.joinedAt
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 가족 멤버 조회
  async findFamilyMember(familyId: number, userId: number): Promise<any> {
    const query = `
      SELECT fm.*, u.name, u.email
      FROM family_members fm
      JOIN users u ON fm.user_id = u.id
      WHERE fm.family_id = $1 AND fm.user_id = $2
    `;
    
    const result = await pool.query(query, [familyId, userId]);
    const member = result.rows[0];
    if (member && member.permissions) {
      member.permissions = JSON.parse(member.permissions);
    }
    return member;
  }

  // 승인된 가족 멤버 조회
  async findAcceptedFamilyMember(familyId: number, userId: number): Promise<any> {
    const query = `
      SELECT fm.*, u.name, u.email
      FROM family_members fm
      JOIN users u ON fm.user_id = u.id
      WHERE fm.family_id = $1 AND fm.user_id = $2 AND fm.status = 'accepted'
    `;
    
    const result = await pool.query(query, [familyId, userId]);
    const member = result.rows[0];
    if (member && member.permissions) {
      member.permissions = JSON.parse(member.permissions);
    }
    return member;
  }

  // 대기 중인 초대 조회
  async findPendingInvitation(memberId: number, userId: number): Promise<any> {
    const query = `
      SELECT * FROM family_members
      WHERE id = $1 AND user_id = $2 AND status = 'pending'
    `;
    
    const result = await pool.query(query, [memberId, userId]);
    return result.rows[0];
  }

  // 가족 멤버 업데이트
  async updateFamilyMember(memberId: number, updateData: any): Promise<any> {
    const setClause = Object.keys(updateData).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [memberId, ...Object.values(updateData)];
    
    const query = `
      UPDATE family_members
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 이메일로 사용자 조회
  async findUserByEmail(email: string): Promise<any> {
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // 공유 목표 생성
  async createSharedGoal(goalData: SharedGoalData): Promise<any> {
    const query = `
      INSERT INTO shared_goals (family_id, created_by, title, description, target_amount, current_amount, category, target_date, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *
    `;
    
    const values = [
      goalData.familyId,
      goalData.createdBy,
      goalData.title,
      goalData.description,
      goalData.targetAmount,
      goalData.currentAmount,
      goalData.category,
      goalData.targetDate,
      goalData.status
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 공유 목표 조회
  async findSharedGoalById(goalId: number): Promise<any> {
    const query = `
      SELECT sg.*, u.name as creator_name, f.name as family_name
      FROM shared_goals sg
      JOIN users u ON sg.created_by = u.id
      JOIN families f ON sg.family_id = f.id
      WHERE sg.id = $1
    `;
    
    const result = await pool.query(query, [goalId]);
    return result.rows[0];
  }

  // 공유 목표 업데이트
  async updateSharedGoal(goalId: number, updateData: any): Promise<any> {
    const setClause = Object.keys(updateData).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [goalId, ...Object.values(updateData)];
    
    const query = `
      UPDATE shared_goals
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 목표 기여금 생성
  async createGoalContribution(contributionData: GoalContributionData): Promise<any> {
    const query = `
      INSERT INTO goal_contributions (goal_id, user_id, amount, note, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;
    
    const values = [
      contributionData.goalId,
      contributionData.userId,
      contributionData.amount,
      contributionData.note
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 가족 목표 목록
  async findFamilyGoals(familyId: number): Promise<any[]> {
    const query = `
      SELECT sg.*, u.name as creator_name,
             COUNT(gc.id) as contributions_count,
             COALESCE(SUM(gc.amount), 0) as total_contributed
      FROM shared_goals sg
      JOIN users u ON sg.created_by = u.id
      LEFT JOIN goal_contributions gc ON sg.id = gc.goal_id
      WHERE sg.family_id = $1
      GROUP BY sg.id, u.name
      ORDER BY sg.created_at DESC
    `;
    
    const result = await pool.query(query, [familyId]);
    return result.rows;
  }

  // 가족 거래 생성
  async createFamilyTransaction(transactionData: FamilyTransactionData): Promise<any> {
    const query = `
      INSERT INTO family_transactions (family_id, user_id, type, amount, description, category, date, split_details, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `;
    
    const values = [
      transactionData.familyId,
      transactionData.userId,
      transactionData.type,
      transactionData.amount,
      transactionData.description,
      transactionData.category,
      transactionData.date,
      transactionData.splitDetails ? JSON.stringify(transactionData.splitDetails) : null
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 가족 거래 목록
  async findFamilyTransactions(familyId: number, filters: any): Promise<{ transactions: any[]; total: number }> {
    let whereClause = 'WHERE ft.family_id = $1';
    const values: any[] = [familyId];
    let paramCount = 1;

    if (filters.startDate) {
      paramCount++;
      whereClause += ` AND ft.date >= $${paramCount}`;
      values.push(filters.startDate);
    }

    if (filters.endDate) {
      paramCount++;
      whereClause += ` AND ft.date <= $${paramCount}`;
      values.push(filters.endDate);
    }

    if (filters.category) {
      paramCount++;
      whereClause += ` AND ft.category = $${paramCount}`;
      values.push(filters.category);
    }

    if (filters.type) {
      paramCount++;
      whereClause += ` AND ft.type = $${paramCount}`;
      values.push(filters.type);
    }

    // 총 개수 조회
    const countQuery = `
      SELECT COUNT(*) as total
      FROM family_transactions ft
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // 거래 목록 조회
    let query = `
      SELECT ft.*, u.name as user_name
      FROM family_transactions ft
      JOIN users u ON ft.user_id = u.id
      ${whereClause}
      ORDER BY ft.date DESC, ft.created_at DESC
    `;

    if (filters.page && filters.limit) {
      const offset = (filters.page - 1) * filters.limit;
      query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      values.push(filters.limit, offset);
    }

    const result = await pool.query(query, values);
    
    return {
      transactions: result.rows,
      total
    };
  }

  // 가족 대시보드 데이터
  async getFamilyDashboardData(familyId: number): Promise<any> {
    // 가족 정보
    const family = await this.findFamilyById(familyId);

    // 통계 계산
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM family_members WHERE family_id = $1 AND status = 'accepted') as total_members,
        (SELECT COUNT(*) FROM shared_goals WHERE family_id = $1 AND status = 'active') as active_goals,
        (SELECT COUNT(*) FROM shared_goals WHERE family_id = $1 AND status = 'completed') as completed_goals,
        (SELECT COALESCE(SUM(amount), 0) FROM family_transactions 
         WHERE family_id = $1 AND type = 'income' 
         AND date >= DATE_TRUNC('month', CURRENT_DATE)) as monthly_income,
        (SELECT COALESCE(SUM(amount), 0) FROM family_transactions 
         WHERE family_id = $1 AND type = 'expense' 
         AND date >= DATE_TRUNC('month', CURRENT_DATE)) as monthly_expenses
    `;
    
    const statsResult = await pool.query(statsQuery, [familyId]);
    const stats = statsResult.rows[0];

    const budgetUtilization = family.shared_budget 
      ? (parseFloat(stats.monthly_expenses) / parseFloat(family.shared_budget)) * 100 
      : 0;

    // 최근 거래
    const recentTransactionsQuery = `
      SELECT ft.*, u.name as user_name
      FROM family_transactions ft
      JOIN users u ON ft.user_id = u.id
      WHERE ft.family_id = $1
      ORDER BY ft.created_at DESC
      LIMIT 5
    `;
    const recentTransactionsResult = await pool.query(recentTransactionsQuery, [familyId]);

    // 활성 목표
    const activeGoalsQuery = `
      SELECT sg.*, u.name as creator_name
      FROM shared_goals sg
      JOIN users u ON sg.created_by = u.id
      WHERE sg.family_id = $1 AND sg.status = 'active'
      ORDER BY sg.target_date ASC
      LIMIT 3
    `;
    const activeGoalsResult = await pool.query(activeGoalsQuery, [familyId]);

    return {
      family,
      summary: {
        totalMembers: parseInt(stats.total_members),
        activeGoals: parseInt(stats.active_goals),
        completedGoals: parseInt(stats.completed_goals),
        monthlyIncome: parseFloat(stats.monthly_income),
        monthlyExpenses: parseFloat(stats.monthly_expenses),
        budgetUtilization
      },
      recentTransactions: recentTransactionsResult.rows,
      activeGoals: activeGoalsResult.rows
    };
  }
}
