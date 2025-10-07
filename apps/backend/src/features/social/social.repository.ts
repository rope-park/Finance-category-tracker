/**
 * 소셜 기능 데이터 접근 레이어 (Repository)
 * 
 * 가족 그룹, 공동 목표, 소셜 거래 등 사용자 간 협력적 금융 관리 기능을 위한 데이터 접근 계층.
 * 개인정보 보호와 보안을 고려하면서 가족/친구 간 안전한 데이터 공유 지원.
 * 
 * 주요 기능:
 * - 가족 그룹 생성 및 관리 (가족 구성원 초대, 권한 관리)
 * - 공동 재정 목표 설정 및 진행률 추적
 * - 가족 내 공동 거래 및 비용 분담 관리
 * - 소셜 대시보드 및 통계 데이터 제공
 * - 멤버 간 권한 제어 및 접근 관리
 * 
 * 보안 고려사항:
 * - 가족 구성원만 데이터 접근 가능하도록 권한 검증
 * - 민감한 재정 정보의 선택적 공유 설정
 * - 멤버 초대 시 이메일 인증 및 승인 프로세스
 * - 개인정보보호법 준수를 위한 데이터 익명화
 * 
 * @author Ju Eul Park (rope-park)
 */
import pool from '../../core/config/database';

/**
 * 가족 그룹 생성 데이터 인터페이스
 */
export interface FamilyData {
  name: string;         // 가족 그룹 이름
  description?: string; // 가족 그룹 설명 (선택적)
  currency?: string;    // 기본 통화 단위 (KRW, USD 등)
  sharedBudget?: number; // 공동 예산 금액 (선택적)
  ownerId: number;      // 그룹 소유자 사용자 ID
  status: string;       // 그룹 상태 (active, inactive, deleted)
}

/**
 * 가족 구성원 데이터 인터페이스
 * 
 * 가족 그룹의 멤버 정보와 권한, 역할을 관리하는 데이터 구조.
 * 멤버별로 다른 접근 권한과 기능 사용 범위 설정 가능.
 */
export interface FamilyMemberData {
  familyId: number;   // 소속 가족 그룹 ID
  userId: number;     // 멤버 사용자 ID
  role: string;       // 멤버 역할 (owner, admin, member, viewer)
  status: string;     // 멤버 상태 (pending, accepted, declined, removed)
  permissions: any;   // 멤버 권한 설정 (JSON 객체)
  joinedAt?: Date;    // 그룹 가입 시간 (선택적)
}

/**
 * 공동 목표 데이터 인터페이스
 * 
 * 가족 구성원들이 함께 달성하고자 하는 재정 목표 관리.
 * 목표 달성을 위한 기여금과 진행률을 추적.
 */
export interface SharedGoalData {
  familyId: number;   // 소속 가족 그룹 ID
  createdBy: number;  // 목표 생성자 사용자 ID
  title: string;      // 목표 제목
  description?: string; // 목표 상세 설명 (선택적)
  targetAmount: number;  // 목표 금액
  currentAmount: number; // 현재 달성 금액
  category: string;      // 목표 카테고리 (vacation, home, education 등)
  targetDate: Date;     // 목표 달성 예정일
  status: string;       // 목표 상태 (active, completed, paused, cancelled)
}

/**
 * 목표 기여금 데이터 인터페이스
 * 
 * 공동 목표에 대한 개별 멤버의 기여금 정보를 관리.
 * 누가 언제 얼마나 기여했는지 투명하게 추적.
 */
export interface GoalContributionData {
  goalId: number;  // 소속 목표 ID
  userId: number;  // 기여한 사용자 ID
  amount: number;  // 기여 금액
  note?: string;   // 기여에 대한 메모 (선택적)
}

/**
 * 가족 거래 데이터 인터페이스
 * 
 * 가족 구성원 간 공동 지출, 비용 분담, 용돈 등의 거래 정보를 관리.
 */
export interface FamilyTransactionData {
  familyId: number;   // 소속 가족 그룹 ID
  userId: number;     // 거래 수행자 사용자 ID
  type: string;       // 거래 유형 (income, expense, transfer, allowance)
  amount: number;     // 거래 금액
  description: string; // 거래 설명
  category: string;    // 거래 카테고리
  date: Date;         // 거래 날짜
  splitDetails?: any; // 비용 분담 상세 정보 (JSON 객체, 선택적)
}

/**
 * 소셜 기능 데이터 접근 클래스
 * 
 * PostgreSQL 데이터베이스와 연동하여 가족 그룹, 공동 목표, 소셜 거래 등
 * 협력적 금융 관리 기능의 모든 데이터 작업을 처리하는 리포지토리 클래스.
 */
export class SocialRepository {
  /**
   * 새로운 가족 그룹 생성 메서드
   * @param familyData - 가족 그룹 생성에 필요한 정보 (이름, 설명, 통화, 예산 등)
   * @returns 생성된 가족 그룹 정보
   */
  async createFamily(familyData: FamilyData): Promise<any> {
    const query = `
      INSERT INTO families (name, description, currency, shared_budget, owner_id, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `;
    
    const values = [
      familyData.name,
      familyData.description,
      familyData.currency || 'KRW', // 기본 통화를 한국 원으로 설정
      familyData.sharedBudget,
      familyData.ownerId,
      familyData.status
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * ID로 가족 그룹 정보 조회 메서드
   * @param familyId - 조회할 가족 그룹 ID
   * @returns 가족 그룹 정보 (소유자 정보, 멤버 수, 목표 수 포함)
   */
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

  /**
   * 사용자가 속한 모든 가족 그룹 목록 조회 메서드
   * @param userId - 조회할 사용자 ID
   * @returns 사용자가 속한 가족 그룹 목록 (역할, 권한 정보 포함)
   */
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

  /**
   * 새로운 가족 멤버 추가 메서드
   * @param memberData - 멤버 추가에 필요한 정보 (가족ID, 사용자ID, 역할, 권한 등)
   * @returns 생성된 멤버 정보
   */
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
      JSON.stringify(memberData.permissions), // 권한을 JSON 문자열로 저장
      memberData.joinedAt
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * 특정 가족 그룹 내 멤버 정보 조회 메서드
   * @param familyId - 가족 그룹 ID
   * @param userId - 조회할 사용자 ID
   * @returns 멤버 정보 (사용자 정보 및 권한 포함)
   * 
   */
  async findFamilyMember(familyId: number, userId: number): Promise<any> {
    const query = `
      SELECT fm.*, u.name, u.email
      FROM family_members fm
      JOIN users u ON fm.user_id = u.id
      WHERE fm.family_id = $1 AND fm.user_id = $2
    `;
    
    const result = await pool.query(query, [familyId, userId]);
    const member = result.rows[0];
    
    // JSON 문자열로 저장된 권한을 객체로 파싱
    if (member && member.permissions) {
      member.permissions = JSON.parse(member.permissions);
    }
    return member;
  }

  /**
   * 승인된 가족 멤버 정보 조회 메서드
   * @param familyId - 가족 그룹 ID
   * @param userId - 조회할 사용자 ID
   * @returns 승인된 멤버 정보 (권한 객체 포함), 없으면 undefined
   */
  async findAcceptedFamilyMember(familyId: number, userId: number): Promise<any> {
    const query = `
      SELECT fm.*, u.name, u.email
      FROM family_members fm
      JOIN users u ON fm.user_id = u.id
      WHERE fm.family_id = $1 AND fm.user_id = $2 AND fm.status = 'accepted'
    `;
    
    const result = await pool.query(query, [familyId, userId]);
    const member = result.rows[0];
    
    // JSON 문자열로 저장된 권한을 객체로 파싱
    if (member && member.permissions) {
      member.permissions = JSON.parse(member.permissions);
    }
    return member;
  }

  /**
   * 대기 중인 초대 조회 메서드
   * @param memberId - 멤버 레코드 ID
   * @param userId - 초대받은 사용자 ID
   * @returns 대기 중인 초대 정보, 없으면 undefined
   */
  async findPendingInvitation(memberId: number, userId: number): Promise<any> {
    const query = `
      SELECT * FROM family_members
      WHERE id = $1 AND user_id = $2 AND status = 'pending'
    `;
    
    const result = await pool.query(query, [memberId, userId]);
    return result.rows[0];
  }

  /**
   * 가족 멤버 정보 업데이트 메서드
   * @param memberId - 업데이트할 멤버 ID
   * @param updateData - 업데이트할 데이터 객체 (키-값 쌍)
   * @returns 업데이트된 멤버 정보
   */
  async updateFamilyMember(memberId: number, updateData: any): Promise<any> {
    // 동적으로 SET 절 생성 (field = $paramIndex 형태)
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

  /**
   * 이메일 주소로 사용자 조회 메서드
   * @param email - 조회할 사용자의 이메일 주소
   * @returns 사용자 정보, 없으면 undefined
   */
  async findUserByEmail(email: string): Promise<any> {
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  /**
   * 새로운 공동 목표 생성 메서드
   * @param goalData - 목표 생성에 필요한 정보 (제목, 목표금액, 달성일 등)
   * @returns 생성된 공동 목표 정보
   */
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

  /**
   * ID로 공동 목표 정보 조회 메서드
   * @param goalId - 조회할 목표 ID
   * @returns 목표 정보 (생성자명, 가족명 포함)
   */
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

  /**
   * 공동 목표 정보 업데이트 메서드
   * @param goalId - 업데이트할 목표 ID
   * @param updateData - 업데이트할 데이터 객체
   * @returns 업데이트된 목표 정보
   */
  async updateSharedGoal(goalId: number, updateData: any): Promise<any> {
    // 동적으로 SET 절 생성
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

  /**
   * 목표 기여금을 추가 메서드
   * @param contributionData - 기여금 정보 (목표 ID, 사용자 ID, 금액, 메모)
   * @returns 생성된 기여금 레코드
   */
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

  /**
   * 가족 그룹의 모든 목표 목록 조회 메서드
   * @param familyId - 가족 그룹 ID
   * @returns 목표 목록 (생성자, 기여 현황 포함)
   */
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

  /**
   * 가족 거래 생성 메서드
   * @param transactionData - 거래 정보 (가족ID, 사용자ID, 유형, 금액, 설명 등)
   * @returns 생성된 거래 레코드
   */
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
      // 비용 분담 상세 정보를 JSON 문자열로 저장
      transactionData.splitDetails ? JSON.stringify(transactionData.splitDetails) : null
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * 가족 거래 목록 조회 메서드
   * @param familyId - 가족 그룹 ID
   * @param filters - 필터링 조건 (기간, 카테고리, 유형, 페이지네이션)
   * @returns 거래 목록과 총 개수
   */
  async findFamilyTransactions(familyId: number, filters: any): Promise<{ transactions: any[]; total: number }> {
    let whereClause = 'WHERE ft.family_id = $1';
    const values: any[] = [familyId];
    let paramCount = 1;

    // 시작 날짜 필터 적용
    if (filters.startDate) {
      paramCount++;
      whereClause += ` AND ft.date >= $${paramCount}`;
      values.push(filters.startDate);
    }

    // 종료 날짜 필터 적용
    if (filters.endDate) {
      paramCount++;
      whereClause += ` AND ft.date <= $${paramCount}`;
      values.push(filters.endDate);
    }

    // 카테고리 필터 적용
    if (filters.category) {
      paramCount++;
      whereClause += ` AND ft.category = $${paramCount}`;
      values.push(filters.category);
    }

    // 거래 유형 필터 적용
    if (filters.type) {
      paramCount++;
      whereClause += ` AND ft.type = $${paramCount}`;
      values.push(filters.type);
    }

    // 총 거래 개수 조회 (페이지네이션용)
    const countQuery = `
      SELECT COUNT(*) as total
      FROM family_transactions ft
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // 거래 목록 조회 (사용자 이름 포함)
    let query = `
      SELECT ft.*, u.name as user_name
      FROM family_transactions ft
      JOIN users u ON ft.user_id = u.id
      ${whereClause}
      ORDER BY ft.date DESC, ft.created_at DESC
    `;

    // 페이지네이션 적용
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

  /**
   * 가족 대시보드 종합 데이터 조회 메서드
   * @param familyId - 가족 그룹 ID
   * @returns 대시보드용 종합 데이터 (가족 정보, 통계, 최근 활동 등)
   */
  async getFamilyDashboardData(familyId: number): Promise<any> {
    // 기본 가족 정보 조회 (멤버 수, 목표 수 포함)
    const family = await this.findFamilyById(familyId);

    // 주요 통계 데이터 일괄 조회 (단일 쿼리로 성능 최적화)
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

    // 예산 사용률 계산 (공동 예산 대비 이번 달 지출 비율)
    const budgetUtilization = family.shared_budget 
      ? (parseFloat(stats.monthly_expenses) / parseFloat(family.shared_budget)) * 100 
      : 0;

    // 최근 5개 거래 내역 조회 (대시보드 미리보기용)
    const recentTransactionsQuery = `
      SELECT ft.*, u.name as user_name
      FROM family_transactions ft
      JOIN users u ON ft.user_id = u.id
      WHERE ft.family_id = $1
      ORDER BY ft.created_at DESC
      LIMIT 5
    `;
    const recentTransactionsResult = await pool.query(recentTransactionsQuery, [familyId]);

    // 활성 목표 3개 조회 (마감일 순으로 정렬)
    const activeGoalsQuery = `
      SELECT sg.*, u.name as creator_name
      FROM shared_goals sg
      JOIN users u ON sg.created_by = u.id
      WHERE sg.family_id = $1 AND sg.status = 'active'
      ORDER BY sg.target_date ASC
      LIMIT 3
    `;
    const activeGoalsResult = await pool.query(activeGoalsQuery, [familyId]);

    // 대시보드용 데이터 구조체 반환
    return {
      family,                                    // 가족 기본 정보
      summary: {                                 // 통계 요약
        totalMembers: parseInt(stats.total_members),
        activeGoals: parseInt(stats.active_goals),
        completedGoals: parseInt(stats.completed_goals),
        monthlyIncome: parseFloat(stats.monthly_income),
        monthlyExpenses: parseFloat(stats.monthly_expenses),
        budgetUtilization                        // 예산 사용률 (%)
      },
      recentTransactions: recentTransactionsResult.rows,  // 최근 거래 내역
      activeGoals: activeGoalsResult.rows        // 활성 목표 목록
    };
  }
}
