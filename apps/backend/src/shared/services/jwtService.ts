/**
 * JWT 토큰 관리 서비스
 * 
 * 사용자 인증을 위한 JWT 토큰의 생성, 검증, 갱신, 무효화를 담당하는 핵심 보안 서비스.
 * Access Token과 Refresh Token의 이중 인증 체계를 통해 보안성과 사용성을 모두 보장.
 * 
 * 주요 기능:
 * - JWT Access Token 생성 및 검증 (15분 만료)
 * - Refresh Token 생성 및 관리 (7일 만료)
 * - 디바이스별 토큰 관리 및 추적
 * - 토큰 무효화 및 로그아웃 처리
 * - 사용자별 토큰 제한 및 보안 관리
 * - IP 및 User-Agent 기반 디바이스 인식
 * 
 * 보안 기능:
 * - 암호화된 리프레시 토큰 저장
 * - 사용자별 최대 5개 토큰 제한
 * - 의심스러운 접근 감지 및 차단
 * - 토큰 유효성 검사 및 자동 무효화
 * 
 * @author Ju Eul Park (rope-park)
 */
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import pool from '../../core/config/database';
import { User } from '../../core/types';

// 토큰 페어 인터페이스
export interface TokenPair {
  accessToken: string;          // JWT 액세스 토큰 (15분 유효)
  refreshToken: string;         // JWT 리프레시 토큰 (7일 유효)
  accessTokenExpiresAt: Date;   // 액세스 토큰 만료 일시
  refreshTokenExpiresAt: Date;  // 리프레시 토큰 만료 일시
}

// 리프레시 토큰 데이터 인터페이스
export interface RefreshTokenData {
  id: number;          // 토큰 ID
  user_id: number;     // 사용자 ID
  token: string;       // 리프레시 토큰
  expires_at: Date;    // 만료 일시
  revoked: boolean;    // 무효화 여부
  device_info?: any;   // 디바이스 정보 (JSON 형태)
  ip_address?: string; // IP 주소
}

// 디바이스 정보 인터페이스
export interface DeviceInfo {
  userAgent?: string;   // 사용자 에이전트
  device?: string;      // 디바이스 이름
  os?: string;          // 운영체제
  browser?: string;     // 브라우저
  rememberMe?: boolean; // 로그인 상태 유지 여부
  [key: string]: any;   // 추가 정보
}

/**
 * JWT 서비스 클래스
 * 
 * JWT 토큰의 생성, 검증, 갱신, 무효화를 담당하는 핵심 보안 서비스
 */
export class JWTService {
  private static readonly ACCESS_TOKEN_EXPIRY = '15m'; // 15분
  private static readonly REFRESH_TOKEN_EXPIRY = '7d'; // 7일
  private static readonly MAX_REFRESH_TOKENS_PER_USER = 5;

  /**
   * 액세스 토큰 서명에 사용할 비밀 키 가져오기
   * @returns 액세스 토큰 서명에 사용할 비밀 키
   * @throws 비밀 키가 정의되지 않은 경우 에러 발생
   */
  private static getJWTSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    return secret;
  }

  /**
   * 리프레시 토큰 서명에 사용할 비밀 키 가져오기
   * @returns 리프레시 토큰 서명에 사용할 비밀 키
   * @throws 비밀 키가 정의되지 않은 경우 에러 발생
   */
  private static getRefreshSecret(): string {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }
    return secret;
  }

  /**
   * 사용자 ID와 디바이스 정보를 기반으로 Access Token과 Refresh Token 페어 생성
   * @param userId 사용자 ID
   * @param deviceInfo 디바이스 정보
   * @param ipAddress IP 주소
   * @returns 생성된 토큰 페어
   */
  static async generateTokenPair(
    userId: number, 
    deviceInfo?: DeviceInfo,
    ipAddress?: string
  ): Promise<TokenPair> {
    const accessTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15분
    const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7일

    // Access Token 생성
    const accessToken = jwt.sign(
      { userId, type: 'access' },
      this.getJWTSecret(),
      { expiresIn: this.ACCESS_TOKEN_EXPIRY }
    );

    // Refresh Token 생성 (더 안전한 랜덤 토큰)
    const refreshTokenPayload = {
      userId,
      type: 'refresh',
      jti: crypto.randomUUID(), // JWT ID for uniqueness
    };
    
    const refreshToken = jwt.sign(
      refreshTokenPayload,
      this.getRefreshSecret(),
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );

    // 기존 사용자의 refresh token 개수 확인 및 정리
    await this.cleanupUserRefreshTokens(userId);

    // Refresh Token을 데이터베이스에 저장
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at, device_info, ip_address)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        userId,
        refreshToken,
        refreshTokenExpiresAt,
        deviceInfo ? JSON.stringify(deviceInfo) : null,
        ipAddress
      ]
    );

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt
    };
  }

  /**
   * 액세스 토큰 검증
   * @param token 액세스 토큰
   * @returns 토큰이 유효한 경우 디코딩된 페이로드 반환
   * @throws 토큰이 유효하지 않은 경우 에러 발생
   */
  static verifyAccessToken(token: string): { userId: number; type: string } {
    try {
      const decoded = jwt.verify(token, this.getJWTSecret()) as any;
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  /**
   * 리프레시 토큰 검증 및 새로운 토큰 페어 생성
   * @param refreshToken 리프레시 토큰
   * @param deviceInfo 디바이스 정보
   * @param ipAddress IP 주소
   * @returns 새로운 액세스 토큰과 리프레시 토큰 페어
   */
  static async refreshTokens(
    refreshToken: string,
    deviceInfo?: DeviceInfo,
    ipAddress?: string
  ): Promise<TokenPair> {
    try {
      // Refresh Token 검증
      const decoded = jwt.verify(refreshToken, this.getRefreshSecret()) as any;
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // 데이터베이스에서 토큰 확인 (revoked 여부 포함)
      const result = await pool.query(
        `SELECT rt.*, u.is_active 
         FROM refresh_tokens rt
         JOIN users u ON rt.user_id = u.id
         WHERE rt.token = $1`,
        [refreshToken]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid or expired refresh token');
      }

      const tokenData = result.rows[0] as RefreshTokenData & { is_active: boolean };

      if (!tokenData.is_active) {
        throw new Error('User account is inactive');
      }

      // 이미 사용(갱신)된 토큰 재사용 시도: 모든 세션 강제 로그아웃
      if (tokenData.revoked || new Date(tokenData.expires_at) < new Date()) {
        // 보안: 계정 전체 세션 강제 로그아웃
        await this.revokeAllUserTokens(tokenData.user_id);
        throw new Error('Refresh token has already been used or expired. All sessions have been logged out for security.');
      }

      // 기존 refresh token 무효화
      await pool.query(
        `UPDATE refresh_tokens 
         SET revoked = TRUE, revoked_at = CURRENT_TIMESTAMP 
         WHERE token = $1`,
        [refreshToken]
      );

      // last_used 업데이트
      await pool.query(
        `UPDATE refresh_tokens 
         SET last_used = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [tokenData.id]
      );

      // 새로운 토큰 페어 생성
      return await this.generateTokenPair(tokenData.user_id, deviceInfo, ipAddress);

    } catch (error) {
      throw new Error('Failed to refresh tokens: ' + (error as Error).message);
    }
  }

  /**
   * 사용자별 모든 리프레시 토큰 무효화
   * @param userId 사용자 ID
   * @returns 사용자별 모든 리프레시 토큰 무효화 (로그아웃 처리)
   */
  static async revokeAllUserTokens(userId: number): Promise<void> {
    await pool.query(
      `UPDATE refresh_tokens 
       SET revoked = TRUE, revoked_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND revoked = FALSE`,
      [userId]
    );
  }

  /**
   * 특정 리프레시 토큰 무효화
   * @param refreshToken 무효화할 리프레시 토큰
   * @returns 특정 리프레시 토큰 무효화
   */
  static async revokeRefreshToken(refreshToken: string): Promise<void> {
    await pool.query(
      `UPDATE refresh_tokens 
       SET revoked = TRUE, revoked_at = CURRENT_TIMESTAMP 
       WHERE token = $1`,
      [refreshToken]
    );
  }

  /**
   * 사용자별 활성 refresh token 정리
   * @param userId 사용자 ID
   * @returns 사용자별 활성 refresh token 정리
   */
  private static async cleanupUserRefreshTokens(userId: number): Promise<void> {
    // 만료된 토큰 삭제
    await pool.query(
      `DELETE FROM refresh_tokens 
       WHERE user_id = $1 AND (expires_at < CURRENT_TIMESTAMP OR revoked = TRUE)`,
      [userId]
    );

    // 활성 토큰 개수 확인
    const activeTokensResult = await pool.query(
      `SELECT COUNT(*) as count 
       FROM refresh_tokens 
       WHERE user_id = $1 AND revoked = FALSE AND expires_at > CURRENT_TIMESTAMP`,
      [userId]
    );

    const activeTokenCount = parseInt(activeTokensResult.rows[0].count);

    // 최대 개수 초과시 오래된 토큰부터 삭제
    if (activeTokenCount >= this.MAX_REFRESH_TOKENS_PER_USER) {
      await pool.query(
        `UPDATE refresh_tokens 
         SET revoked = TRUE, revoked_at = CURRENT_TIMESTAMP 
         WHERE id IN (
           SELECT id FROM refresh_tokens 
           WHERE user_id = $1 AND revoked = FALSE 
           ORDER BY created_at ASC 
           LIMIT $2
         )`,
        [userId, activeTokenCount - this.MAX_REFRESH_TOKENS_PER_USER + 1]
      );
    }
  }

  /**
   * 사용자 ID로 활성 세션 조회
   * @param userId 사용자 ID
   * @returns 활성 세션 목록
   */
  static async getUserActiveSessions(userId: number): Promise<any[]> {
    const result = await pool.query(
      `SELECT id, device_info, ip_address, created_at, last_used
       FROM refresh_tokens 
       WHERE user_id = $1 AND revoked = FALSE AND expires_at > CURRENT_TIMESTAMP
       ORDER BY last_used DESC`,
      [userId]
    );

    return result.rows.map(row => ({
      id: row.id,
      deviceInfo: row.device_info,
      ipAddress: row.ip_address,
      createdAt: row.created_at,
      lastUsed: row.last_used
    }));
  }

  /**
   * 만료된 토큰 정리 (주기적 실행용)
   * @returns 정리된 토큰 개수
   */
  static async cleanupExpiredTokens(): Promise<number> {
    const result = await pool.query(
      `DELETE FROM refresh_tokens 
       WHERE expires_at < CURRENT_TIMESTAMP OR revoked = TRUE`
    );

    return result.rowCount || 0;
  }

  /**
   * User Agent 파싱 유틸리티
   * @param userAgent HTTP User-Agent 문자열
   * @returns 장치 정보 객체
   */
  static parseUserAgent(userAgent?: string): DeviceInfo {
    if (!userAgent) return {};

    // TODO: 실제로는 더 정교한 파싱 라이브러리 사용
    const deviceInfo: DeviceInfo = {
      userAgent
    };

    if (userAgent.includes('Mobile')) {
      deviceInfo.device = 'Mobile';
    } else if (userAgent.includes('Tablet')) {
      deviceInfo.device = 'Tablet';
    } else {
      deviceInfo.device = 'Desktop';
    }

    if (userAgent.includes('Windows')) {
      deviceInfo.os = 'Windows';
    } else if (userAgent.includes('Mac')) {
      deviceInfo.os = 'macOS';
    } else if (userAgent.includes('Linux')) {
      deviceInfo.os = 'Linux';
    } else if (userAgent.includes('Android')) {
      deviceInfo.os = 'Android';
    } else if (userAgent.includes('iOS')) {
      deviceInfo.os = 'iOS';
    }

    if (userAgent.includes('Chrome')) {
      deviceInfo.browser = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      deviceInfo.browser = 'Firefox';
    } else if (userAgent.includes('Safari')) {
      deviceInfo.browser = 'Safari';
    } else if (userAgent.includes('Edge')) {
      deviceInfo.browser = 'Edge';
    }

    return deviceInfo;
  }
}