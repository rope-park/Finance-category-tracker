/**
 * 사용자 관리 서비스
 * 
 * 사용자 계정 생성, 인증, 프로필 관리 등 사용자와 관련된 모든 비즈니스 로직 처리.
 * 인증 시스템과 연동되어 로그인, 회원가입, 비밀번호 재설정 등 작업 지원.
 * 
 * 주요 기능:
 * - 사용자 계정 생성 및 인증
 * - 사용자 프로필 조회 및 수정
 * - 비밀번호 암호화 및 보안 관리
 * - 사용자 세션 및 로그인 기록 관리
 * 
 * @author Ju Eul Park (rope-park)
 */

import { User } from '@finance-tracker/shared';
import { UserRepository } from './user.repository';

/**
 * 사용자 관리 비즈니스 로직 클래스
 * 
 * Repository 패턴을 사용하여 데이터 접근과 비즈니스 로직 분리.
 * 사용자 데이터의 일관된 형식 변환과 보안 처리 담당.
 */
export class UserService {
  private static repo = new UserRepository();

  /**
   * 이메일로 사용자 조회
   * @param email - 찾을 사용자의 이메일 주소
   * @returns 사용자 객체 (없으면 null)
   */
  static async findByEmail(email: string): Promise<User | null> {
    const user = await this.repo.findByEmail(email);
    if (!user) return null;
    
    // 날짜 필드를 ISO 문자열 형식으로 변환
    return {
      ...user,
      created_at: user.created_at ? new Date(user.created_at).toISOString() : user.created_at,
      updated_at: user.updated_at ? new Date(user.updated_at).toISOString() : user.updated_at,
      last_login: user.last_login ? new Date(user.last_login).toISOString() : user.last_login
    } as User;
  }

  /**
   * ID로 사용자 조회
   * @param id - 찾을 사용자의 ID
   * @returns 사용자 객체 (없으면 null)
   */
  static async findById(id: number): Promise<User | null> {
    const user = await this.repo.findById(id);
    if (!user) return null;
    
    // 날짜 필드를 ISO 문자열 형식으로 변환
    return {
      ...user,
      created_at: user.created_at ? new Date(user.created_at).toISOString() : user.created_at,
      updated_at: user.updated_at ? new Date(user.updated_at).toISOString() : user.updated_at,
      last_login: user.last_login ? new Date(user.last_login).toISOString() : user.last_login
    } as User;
  }

  /**
   * 사용자 계정 생성
   * @param userData - 생성할 사용자 데이터
   * @returns 생성된 사용자 객체
   */
  static async create(userData: {
    email: string;
    password_hash: string;
    name: string;
  }): Promise<User> {
    const user = await this.repo.createUser(userData);
    return {
      ...user,
      created_at: user.created_at ? new Date(user.created_at).toISOString() : user.created_at,
      updated_at: user.updated_at ? new Date(user.updated_at).toISOString() : user.updated_at,
      last_login: user.last_login ? new Date(user.last_login).toISOString() : user.last_login
    } as User;
  }

  /**
   * 사용자 프로필 업데이트
   * @param id - 사용자 ID
   * @param profileData - 업데이트할 프로필 데이터
   * @returns 업데이트된 사용자 객체
   */
  static async updateProfile(id: number, profileData: {
    name?: string;
    profile_picture?: string;
    phone_number?: string;
    age_group?: string;
    bio?: string;
  }): Promise<User> {
    const user = await this.repo.updateUser(id, profileData);
    return {
      ...user,
      created_at: user.created_at ? new Date(user.created_at).toISOString() : user.created_at,
      updated_at: user.updated_at ? new Date(user.updated_at).toISOString() : user.updated_at,
      last_login: user.last_login ? new Date(user.last_login).toISOString() : user.last_login
    } as User;
  }

  /**
   * 사용자 마지막 로그인 시간 업데이트
   * @param id - 사용자 ID
   */
  static async updateLastLogin(id: number): Promise<void> {
    await this.repo.updateLastLogin(id);
  }

  /**
   * 사용자 계정 삭제
   * @param id - 삭제할 사용자 ID
   */
  static async deleteUser(id: number): Promise<void> {
    await this.repo.hardDelete(id);
  }
}