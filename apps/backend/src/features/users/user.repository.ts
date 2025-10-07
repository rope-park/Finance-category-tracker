/**
 * 사용자 데이터 접근 레이어 (Repository)
 * 
 * 사용자의 모든 계정 데이터에 대한 데이터베이스 작업을 처리하는 데이터 접근 계층.
 * 
 * 주요 기능:
 * - 사용자 계정 CRUD 작업 및 데이터 무결성 보장
 * - 이메일/ID 기반 사용자 검색 및 인증
 * - 비밀번호 리셋, 계정 잠금 등 보안 기능
 * - 사용자 프로필 상태 및 설정 관리
 * 
 * @author Ju Eul Park (rope-park)
 */

import { BaseRepository } from '../../shared/repositories/BaseRepository';
import { User } from '../../core/types';

/**
 * 새로운 사용자 생성에 필요한 데이터 인터페이스
 * 
 * 회원가입 시 사용자로부터 입력받을 필수 및 선택 정보를 정의.
 * 보안을 위해 비밀번호는 이미 해시된 상태로 전달받음.
 */
export interface CreateUserData {
  email: string;                    // 사용자 이메일 주소 (로그인 ID)
  password_hash: string;            // 암호화된 비밀번호 해시
  name: string;                     // 사용자 이름
  profile_completed?: boolean;      // 프로필 완성 여부 (기본값: false)
  is_active?: boolean;              // 계정 활성 상태 (기본값: true)
}

/**
 * 사용자 정보 업데이트에 필요한 데이터 인터페이스
 * 
 * 프로필 수정, 보안 설정, 계정 상태 변경 등 사용자 정보 업데이트에 사용.
 * 모든 필드가 선택사항이므로 부분 업데이트 가능.
 */
export interface UpdateUserData {
  name?: string;                    // 사용자 이름
  profile_picture?: string;         // 프로필 사진 URL
  phone_number?: string;            // 휴대폰 번호
  age_group?: string;               // 연령대 그룹
  bio?: string;                     // 자기소개
  profile_completed?: boolean;      // 프로필 완성 여부
  is_active?: boolean;              // 계정 활성 상태
  last_login?: Date;                // 마지막 로그인 시간
  email_verified?: boolean;         // 이메일 인증 여부
  login_attempts?: number;          // 로그인 시도 횟수 (보안용)
  account_locked_until?: Date;      // 계정 잠금 해제 시간
}

/**
 * 사용자 필터링 옵션 인터페이스
 * 
 * 사용자 목록 조회 시 다양한 조건으로 필터링할 수 있도록 지원.
 * 관리자가 사용자 상태를 모니터링하거나 특정 조건의 사용자를 검색할 때 유용.
 */
export interface UserFilters {
  email?: string;                   // 이메일 주소
  is_active?: boolean;              // 계정 활성 상태
  profile_completed?: boolean;      // 프로필 완성 여부
  age_group?: string;               // 연령대 그룹
  email_verified?: boolean;         // 이메일 인증 여부
  created_after?: Date;             // 생성일 이후
  created_before?: Date;            // 생성일 이전
}

/** 비밀번호 제외 사용자 정보 인터페이스 */
export interface UserWithoutPassword extends Omit<User, 'password_hash'> {}

/**
 * 사용자 데이터 접근 레이어 (Repository)
 * 
 * 사용자 계정 정보, 인증 데이터, 프로필 관리 등 사용자와 관련된
 * 모든 데이터베이스 작업을 처리하는 데이터 접근 레이어.
 */
export class UserRepository extends BaseRepository {
  private readonly tableName = 'users';
  private readonly safeColumns = `
    id, email, name, profile_picture, phone_number, age_group, bio,
    profile_completed, is_active, email_verified, login_attempts,
    account_locked_until, created_at, updated_at, last_login,
    max_active_sessions
  `;

  /**
   * 사용자 생성
   * @param userData 생성할 사용자 데이터
   * @returns 생성된 사용자 정보 (비밀번호 제외)
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
   * ID로 사용자 조회 (비밀번호 제외)
   * @param id 사용자 ID
   * @returns 사용자 정보 또는 null (없을 경우)
   */
  async findById(id: number): Promise<UserWithoutPassword | null> {
    return await this.findOne<UserWithoutPassword>(
      this.tableName,
      { id, is_active: true },
      this.safeColumns
    );
  }

  /**
   * ID로 사용자 조회 (비밀번호 포함 - 로그인용)
   * @param id 사용자 ID
   * @returns 사용자 정보 또는 null (없을 경우)
   */
  async findByIdWithPassword(id: number): Promise<User | null> {
    return await this.findOne<User>(
      this.tableName,
      { id, is_active: true }
    );
  }

  /**
   * 이메일로 사용자 조회 (비밀번호 제외)
   * @param email 사용자 이메일
   * @returns 사용자 정보 또는 null (없을 경우)
   */
  async findByEmail(email: string): Promise<UserWithoutPassword | null> {
    return await this.findOne<UserWithoutPassword>(
      this.tableName,
      { email, is_active: true },
      this.safeColumns
    );
  }

  /**
   * 이메일로 사용자 조회 (비밀번호 포함 - 로그인용)
   * @param email 사용자 이메일
   * @returns 사용자 정보 또는 null (없을 경우)
   */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return await this.findOne<User>(
      this.tableName,
      { email, is_active: true }
    );
  }

  /**
   * 이메일 중복 확인
   * @param email 확인할 이메일 주소
   * @param excludeUserId 제외할 사용자 ID (업데이트 시 자기 자신 제외용)
   * @returns 이메일이 이미 존재하면 true, 아니면 false
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
   * 사용자 정보 업데이트
   * @param id 사용자 ID
   * @param userData 업데이트할 사용자 데이터
   * @returns 업데이트된 사용자 정보 (비밀번호 제외) 또는 null (사용자 없음)
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
   * 사용자를 비활성화 (소프트 삭제)
   * @param id 사용자 ID
   * @returns 성공 여부 (이미 비활성 상태였으면 false)
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
   * 사용자 완전 삭제 (하드 삭제)
   * @param id 사용자 ID
   * @returns 성공 여부 (사용자가 없었으면 false)
   * 
   * 주의: 복구 불가하므로 일반적으로는 deactivate()를 사용하도록 함.
   */
  async hardDelete(id: number): Promise<boolean> {
    return await this.delete(this.tableName, { id });
  }

  /**
   * 마지막 로그인 시간 업데이트
   * @param id 사용자 ID
   */
  async updateLastLogin(id: number): Promise<void> {
    await this.update(
      this.tableName,
      { last_login: new Date() },
      { id }
    );
  }

  /**
   * 로그인 시도 횟수 증가
   * @param id 사용자 ID
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
   * 로그인 시도 횟수 초기화
   * @param id 사용자 ID
   */
  async resetLoginAttempts(id: number): Promise<void> {
    await this.update(
      this.tableName,
      { login_attempts: 0, account_locked_until: null },
      { id }
    );
  }

  /**
   * 계정 잠금 설정
   * @param id 사용자 ID
   * @param lockUntil 잠금 해제 예정 시간
   */
  async lockAccount(id: number, lockUntil: Date): Promise<void> {
    await this.update(
      this.tableName,
      { account_locked_until: lockUntil },
      { id }
    );
  }

  /**
   * 이메일 인증
   * @param id 사용자 ID
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
   * 이메일 인증 토큰 설정
   * @param id 사용자 ID
   * @param token 인증 토큰
   */
  async setEmailVerificationToken(id: number, token: string): Promise<void> {
    await this.update(
      this.tableName,
      { email_verification_token: token },
      { id }
    );
  }

  /**
   * 비밀번호 재설정 토큰 설정
   * @param id 사용자 ID
   * @param token 인증 토큰
   * @param expiresAt 토큰 만료 시간
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
   * 비밀번호 업데이트
   *
   * 비밀번호 변경 시 해시된 비밀번호를 저장하고, 이전 비밀번호와 관련된 모든 정보 무효화.
   *
   * @param id 사용자 ID
   * @param passwordHash 새 비밀번호 해시
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
   * 필터링된 사용자 목록 조회
   * @param filters 필터 조건
   * @param limit 페이지당 사용자 수 (기본값: 50)
   * @param offset 페이지 시작 위치 (기본값: 0)
   * @param orderBy 정렬 기준 (기본값: 생성일 내림차순)
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
   * 사용자 통계 조회
   * @returns 사용자 통계 정보
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
   * 비활성 사용자 정리 (예: 30일간 로그인하지 않은 미인증 사용자)
   * 30일간 로그인하지 않은 미인증 사용자를 비활성화 처리.
   * 데이터 보존을 위해 실제 삭제는 하지 않음.
   * 
   * @param daysSinceLastActivity 마지막 활동 이후 일수 (기본값: 30일)
   * @returns 정리된 사용자 수
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
