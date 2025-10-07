/**
 * 인증 관리 컨트롤러
 * 
 * 사용자 인증 관련 모든 기능 담당하는 핵심 컨트롤러.
 * 보안이 최우선이므로 모든 코드 신중히 작성.
 * 
 * 주요 기능:
 * - 회원가입 (비밀번호 해싱, 중복 검사)
 * - 로그인 (JWT 토큰 발급, 세션 관리)
 * - 토큰 갱신 (리프레시 토큰 처리)
 * - 로그아웃 (토큰 무효화)
 * - 디바이스 정보 추적 (보안 강화)
 * 
 * @author Ju Eul Park (rope-park)
 */

import { Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import pool from '../../core/config/database';
import { 
  RegisterRequest, 
  LoginRequest, 
  AuthResponse, 
  ApiResponse, 
  User 
} from '@finance-tracker/shared';
import { AuthRequest } from '../../shared/middleware/auth';
import { JWTService, DeviceInfo } from '../../shared/services/jwtService';

/**
 * 토큰 갱신 요청 바디 인터페이스
 */
interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * 확장된 사용자 응답 인터페이스
 */
interface EnhancedAuthResponse extends AuthResponse {
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

// 디바이스 정보 추출 헬퍼
const extractDeviceInfo = (req: Request): { deviceInfo: DeviceInfo; ipAddress: string } => {
  const userAgent = req.headers['user-agent'];
  const ipAddress = (req.headers['x-forwarded-for'] as string) || 
                   (req.headers['x-real-ip'] as string) || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress || 
                   '127.0.0.1';

  return {
    deviceInfo: JWTService.parseUserAgent(userAgent),
    ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress
  };
};

// JWT 서명 함수 (타입 안전) - 호환성 유지용
const signJWT = (payload: object, secret: string, expiresIn: string): string => {
  return (jwt as any).sign(payload, secret, { expiresIn });
};

/**
 * 사용자 등록
 * @param req - HTTP 요청 객체
 * @param res - HTTP 응답 객체
 * @returns 사용자 등록 결과
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name }: RegisterRequest = req.body;
    const { deviceInfo, ipAddress } = extractDeviceInfo(req);

    // 이메일 중복 체크
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: '이미 존재하는 이메일입니다.'
      });
    }

    // 비밀번호 해싱
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 사용자 생성
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, profile_completed)
       VALUES ($1, $2, $3, false)
       RETURNING id, email, name, profile_completed, created_at`,
      [email, hashedPassword, name]
    );

    const user = result.rows[0];

    // 사용자 설정 생성
    await pool.query(
      'INSERT INTO user_settings (user_id) VALUES ($1)',
      [user.id]
    );

    // JWT 토큰 페어 생성
    const tokenPair = await JWTService.generateTokenPair(
      user.id, 
      deviceInfo, 
      ipAddress
    );

    const response: ApiResponse<EnhancedAuthResponse> = {
      success: true,
      data: {
        user: {
          ...user,
          profile_picture: null,
          phone_number: null,
          age_group: null,
          bio: null,
          updated_at: user.created_at,
          last_login: null,
          is_active: true
        },
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        accessTokenExpiresAt: tokenPair.accessTokenExpiresAt.toISOString(),
        refreshTokenExpiresAt: tokenPair.refreshTokenExpiresAt.toISOString()
      },
      message: '회원가입이 완료되었습니다.',
      timestamp: new Date().toISOString()
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

/**
 * 사용자 로그인
 * @param req - HTTP 요청 객체
 * @param res - HTTP 응답 객체
 * @returns 로그인 결과
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe }: LoginRequest = req.body;
    const { deviceInfo, ipAddress } = extractDeviceInfo(req);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: '이메일과 비밀번호를 입력해주세요.'
      });
    }

    // 사용자 조회
    const result = await pool.query(
      `SELECT id, email, password_hash, name, profile_picture, phone_number, 
              age_group, bio, profile_completed, created_at, updated_at, is_active
       FROM users 
       WHERE email = $1 AND is_active = true`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    const user = result.rows[0];

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    // 마지막 로그인 시간 업데이트
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // JWT 토큰 페어 생성 (rememberMe 옵션 고려)
    const tokenPair = await JWTService.generateTokenPair(
      user.id, 
      { ...deviceInfo, rememberMe }, 
      ipAddress
    );

    // password_hash 제거
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user;

    const response: ApiResponse<EnhancedAuthResponse> = {
      success: true,
      data: {
        user: {
          ...userWithoutPassword,
          last_login: new Date()
        },
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        accessTokenExpiresAt: tokenPair.accessTokenExpiresAt.toISOString(),
        refreshTokenExpiresAt: tokenPair.refreshTokenExpiresAt.toISOString()
      },
      message: '로그인이 완료되었습니다.',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

/**
 * 토큰 갱신
 * @param req - HTTP 요청 객체
 * @param res - HTTP 응답 객체
 * @returns 토큰 갱신 결과
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken }: RefreshTokenRequest = req.body;
    const { deviceInfo, ipAddress } = extractDeviceInfo(req);

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token이 필요합니다.',
        code: 'REFRESH_TOKEN_REQUIRED'
      });
    }

    // 새로운 토큰 페어 생성
    const tokenPair = await JWTService.refreshTokens(
      refreshToken,
      deviceInfo,
      ipAddress
    );

    const response: ApiResponse = {
      success: true,
      data: {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        accessTokenExpiresAt: tokenPair.accessTokenExpiresAt.toISOString(),
        refreshTokenExpiresAt: tokenPair.refreshTokenExpiresAt.toISOString()
      },
      message: '토큰이 갱신되었습니다.',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('토큰 갱신 오류:', error);
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : '토큰 갱신에 실패했습니다.',
      code: 'REFRESH_FAILED'
    });
  }
};

/**
 * 로그아웃 (특정 세션)
 * @param req - HTTP 요청 객체
 * @param res - HTTP 응답 객체
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken }: { refreshToken?: string } = req.body;

    if (refreshToken) {
      await JWTService.revokeRefreshToken(refreshToken);
    }

    res.json({
      success: true,
      message: '로그아웃되었습니다.'
    });
  } catch (error) {
    console.error('로그아웃 오류:', error);
    res.status(500).json({
      success: false,
      error: '로그아웃 처리 중 오류가 발생했습니다.'
    });
  }
};

/**
 * 모든 세션에서 로그아웃
 * @param req - HTTP 요청 객체
 * @param res - HTTP 응답 객체
 * @returns 모든 세션에서의 로그아웃 결과
 */
export const logoutAll = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: '사용자 인증이 필요합니다.'
      });
    }

    await JWTService.revokeAllUserTokens(req.user.id);

    res.json({
      success: true,
      message: '모든 세션에서 로그아웃되었습니다.'
    });
  } catch (error) {
    console.error('전체 로그아웃 오류:', error);
    res.status(500).json({
      success: false,
      error: '로그아웃 처리 중 오류가 발생했습니다.'
    });
  }
};

/**
 * 현재 활성 세션 조회
 * @param req - HTTP 요청 객체
 * @param res - HTTP 응답 객체
 * @returns 활성 세션 목록
 */
export const getActiveSessions = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: '사용자 인증이 필요합니다.'
      });
    }

    const sessions = await JWTService.getUserActiveSessions(req.user.id);

    res.json({
      success: true,
      data: { sessions },
      message: '활성 세션을 조회했습니다.'
    });
  } catch (error) {
    console.error('세션 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '세션 조회 중 오류가 발생했습니다.'
    });
  }
};

/**
 * 현재 사용자 정보 조회
 * @param req - HTTP 요청 객체
 * @param res - HTTP 응답 객체
 */
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const response: ApiResponse = {
      success: true,
      data: { user: req.user },
      message: '사용자 정보를 조회했습니다.',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

/**
 * 토큰 검증
 * @param req - HTTP 요청 객체
 * @param res - HTTP 응답 객체
 */
export const verifyToken = async (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: { valid: true, user: req.user },
    message: '토큰이 유효합니다.'
  });
};