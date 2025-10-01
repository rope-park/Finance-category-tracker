import { BaseRepository } from '../../shared/repositories/BaseRepository';
import { User } from '../../core/types';

export interface CreateUserData {
  email: string;
  password_hash: string;
  name: string;
  profile_completed?: boolean;
  is_active?: boolean;
}

export interface UpdateUserData {
  name?: string;
  profile_picture?: string;
  phone_number?: string;
  age_group?: string;
  bio?: string;
  profile_completed?: boolean;
  is_active?: boolean;
  last_login?: Date;
  email_verified?: boolean;
  login_attempts?: number;
  account_locked_until?: Date;
}

export interface UserFilters {
  email?: string;
  is_active?: boolean;
  profile_completed?: boolean;
  age_group?: string;
  email_verified?: boolean;
  created_after?: Date;
  created_before?: Date;
}

export interface UserWithoutPassword extends Omit<User, 'password_hash'> {}

export class UserRepository extends BaseRepository {
  private readonly tableName = 'users';
  private readonly safeColumns = `
    id, email, name, profile_picture, phone_number, age_group, bio,
    profile_completed, is_active, email_verified, login_attempts,
    account_locked_until, created_at, updated_at, last_login,
    max_active_sessions
  `;

  /**
   * 사용자를 생성합니다
   */
  async createUser(userData: CreateUserData): Promise<UserWithoutPassword> {
    const data = {
      ...userData,
      profile_completed: userData.profile_completed ?? false,
      is_active: userData.is_active ?? true,
      email_verified: false,
      login_attempts: 0
    };

    return await this.create<UserWithoutPassword>(
      this.tableName,
      data,
      this.safeColumns
    );
  }

  /**
   * ID로 사용자를 조회합니다 (비밀번호 제외)
   */
  async findById(id: number): Promise<UserWithoutPassword | null> {
    return await this.findOne<UserWithoutPassword>(
      this.tableName,
      { id, is_active: true },
      this.safeColumns
    );
  }

  /**
   * ID로 사용자를 조회합니다 (비밀번호 포함 - 인증용)
   */
  async findByIdWithPassword(id: number): Promise<User | null> {
    return await this.findOne<User>(
      this.tableName,
      { id, is_active: true }
    );
  }

  /**
   * 이메일로 사용자를 조회합니다 (비밀번호 제외)
   */
  async findByEmail(email: string): Promise<UserWithoutPassword | null> {
    return await this.findOne<UserWithoutPassword>(
      this.tableName,
      { email, is_active: true },
      this.safeColumns
    );
  }

  /**
   * 이메일로 사용자를 조회합니다 (비밀번호 포함 - 로그인용)
   */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return await this.findOne<User>(
      this.tableName,
      { email, is_active: true }
    );
  }

  /**
   * 이메일 중복을 확인합니다
   */
  async emailExists(email: string, excludeUserId?: number): Promise<boolean> {
    const conditions: Record<string, any> = { email };
    
    if (excludeUserId) {
      conditions.id = { operator: '!=', value: excludeUserId };
    }

    const count = await this.count(this.tableName, conditions);
    return count > 0;
  }

  /**
   * 사용자 정보를 업데이트합니다
   */
  async updateUser(id: number, userData: UpdateUserData): Promise<UserWithoutPassword | null> {
    return await this.update<UserWithoutPassword>(
      this.tableName,
      userData,
      { id, is_active: true },
      this.safeColumns
    );
  }

  /**
   * 사용자를 비활성화합니다 (소프트 삭제)
   */
  async deactivate(id: number): Promise<boolean> {
    const result = await this.update(
      this.tableName,
      { is_active: false },
      { id }
    );
    return result !== null;
  }

  /**
   * 사용자를 완전히 삭제합니다 (하드 삭제)
   */
  async hardDelete(id: number): Promise<boolean> {
    return await this.delete(this.tableName, { id });
  }

  /**
   * 마지막 로그인 시간을 업데이트합니다
   */
  async updateLastLogin(id: number): Promise<void> {
    await this.update(
      this.tableName,
      { last_login: new Date() },
      { id }
    );
  }

  /**
   * 로그인 시도 횟수를 증가시킵니다
   */
  async incrementLoginAttempts(id: number): Promise<void> {
    await this.executeRawQuery(
      `UPDATE ${this.tableName} 
       SET login_attempts = login_attempts + 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );
  }

  /**
   * 로그인 시도 횟수를 초기화합니다
   */
  async resetLoginAttempts(id: number): Promise<void> {
    await this.update(
      this.tableName,
      { login_attempts: 0, account_locked_until: null },
      { id }
    );
  }

  /**
   * 계정을 잠급니다
   */
  async lockAccount(id: number, lockUntil: Date): Promise<void> {
    await this.update(
      this.tableName,
      { account_locked_until: lockUntil },
      { id }
    );
  }

  /**
   * 이메일을 인증합니다
   */
  async verifyEmail(id: number): Promise<void> {
    await this.update(
      this.tableName,
      { 
        email_verified: true,
        email_verification_token: null
      },
      { id }
    );
  }

  /**
   * 이메일 인증 토큰을 설정합니다
   */
  async setEmailVerificationToken(id: number, token: string): Promise<void> {
    await this.update(
      this.tableName,
      { email_verification_token: token },
      { id }
    );
  }

  /**
   * 비밀번호 재설정 토큰을 설정합니다
   */
  async setPasswordResetToken(id: number, token: string, expiresAt: Date): Promise<void> {
    await this.update(
      this.tableName,
      { 
        password_reset_token: token,
        password_reset_expires: expiresAt
      },
      { id }
    );
  }

  /**
   * 비밀번호를 업데이트합니다
   */
  async updatePassword(id: number, passwordHash: string): Promise<void> {
    await this.update(
      this.tableName,
      { 
        password_hash: passwordHash,
        password_reset_token: null,
        password_reset_expires: null
      },
      { id }
    );
  }

  /**
   * 필터 조건으로 사용자 목록을 조회합니다
   */
  async findUsersWithFilters(
    filters: UserFilters = {},
    limit: number = 50,
    offset: number = 0,
    orderBy: string = 'created_at DESC'
  ): Promise<{
    users: UserWithoutPassword[];
    total: number;
  }> {
    const conditions: Record<string, any> = {};

    // 필터 조건 구성
    if (filters.email) conditions.email = filters.email;
    if (filters.is_active !== undefined) conditions.is_active = filters.is_active;
    if (filters.profile_completed !== undefined) conditions.profile_completed = filters.profile_completed;
    if (filters.age_group) conditions.age_group = filters.age_group;
    if (filters.email_verified !== undefined) conditions.email_verified = filters.email_verified;
    if (filters.created_after) {
      conditions.created_at = { operator: '>=', value: filters.created_after };
    }
    if (filters.created_before) {
      conditions.created_at = { operator: '<=', value: filters.created_before };
    }

    const [users, total] = await Promise.all([
      this.findMany<UserWithoutPassword>(
        this.tableName,
        conditions,
        this.safeColumns,
        orderBy,
        limit,
        offset
      ),
      this.count(this.tableName, conditions)
    ]);

    return { users, total };
  }

  /**
   * 사용자 통계를 조회합니다
   */
  async getStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    profileCompletedUsers: number;
    recentSignups: number; // 지난 30일
  }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalResult,
      activeResult,
      verifiedResult,
      profileCompletedResult,
      recentSignupsResult
    ] = await Promise.all([
      this.executeRawQuery<{ count: string }>(`SELECT COUNT(*) as count FROM ${this.tableName}`),
      this.executeRawQuery<{ count: string }>(`SELECT COUNT(*) as count FROM ${this.tableName} WHERE is_active = true`),
      this.executeRawQuery<{ count: string }>(`SELECT COUNT(*) as count FROM ${this.tableName} WHERE email_verified = true`),
      this.executeRawQuery<{ count: string }>(`SELECT COUNT(*) as count FROM ${this.tableName} WHERE profile_completed = true`),
      this.executeRawQuery<{ count: string }>(`SELECT COUNT(*) as count FROM ${this.tableName} WHERE created_at >= $1`, [thirtyDaysAgo])
    ]);

    return {
      totalUsers: parseInt(totalResult.rows[0].count),
      activeUsers: parseInt(activeResult.rows[0].count),
      verifiedUsers: parseInt(verifiedResult.rows[0].count),
      profileCompletedUsers: parseInt(profileCompletedResult.rows[0].count),
      recentSignups: parseInt(recentSignupsResult.rows[0].count)
    };
  }

  /**
   * 비활성 사용자를 정리합니다 (예: 30일간 로그인하지 않은 미인증 사용자)
   */
  async cleanupInactiveUsers(daysSinceLastActivity: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysSinceLastActivity);

    const result = await this.executeRawQuery(
      `UPDATE ${this.tableName} 
       SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE email_verified = false 
         AND (last_login IS NULL OR last_login < $1)
         AND created_at < $1
         AND is_active = true`,
      [cutoffDate]
    );

    return result.rowCount;
  }
}
