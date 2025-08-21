import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../config/database';
import { User } from '../types';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

export interface RefreshTokenData {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  revoked: boolean;
  device_info?: any;
  ip_address?: string;
}

export interface DeviceInfo {
  userAgent?: string;
  device?: string;
  os?: string;
  browser?: string;
  rememberMe?: boolean;
  [key: string]: any; // 추가 정보를 위한 인덱스 시그니처
}

export class JWTService {
  private static readonly ACCESS_TOKEN_EXPIRY = '15m'; // 15분
  private static readonly REFRESH_TOKEN_EXPIRY = '7d'; // 7일
  private static readonly MAX_REFRESH_TOKENS_PER_USER = 5;

  private static getJWTSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    return secret;
  }

  private static getRefreshSecret(): string {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }
    return secret;
  }

  /**
   * Access Token과 Refresh Token 페어 생성
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
   * Access Token 검증
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
   * Refresh Token 검증 및 새로운 토큰 페어 생성
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
   * 특정 사용자의 모든 refresh token 무효화
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
   * 특정 refresh token 무효화
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
   * 사용자의 refresh token 정리 (최대 개수 초과시 오래된 것부터 삭제)
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
   * 사용자의 활성 세션 조회
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
   * 전역 토큰 정리 (크론잡용)
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
   */
  static parseUserAgent(userAgent?: string): DeviceInfo {
    if (!userAgent) return {};

    // 간단한 파싱 (실제로는 ua-parser-js 등의 라이브러리 사용 권장)
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
