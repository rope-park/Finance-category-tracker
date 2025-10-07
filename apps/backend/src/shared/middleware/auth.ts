/**
 * JWT 기반 인증 미들웨어
 * 
 * Express.js 애플리케이션에서 JWT(JSON Web Token)를 사용한 사용자 인증을 처리.
 * API 요청의 Authorization 헤더에서 토큰을 추출하고 검증하여 사용자 인증 상태를 관리.
 * 
 * 주요 기능:
 * - JWT 액세스 토큰 검증 및 디코딩
 * - 사용자 인증 상태 확인 및 데이터베이스 연동
 * - 보안 인증이 필요한 API 엔드포인트 보호
 * - 인증 오류 및 예외 상황 처리
 * 
 * @author Ju Eul Park (rope-park)
 */

import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import pool from '../../core/config/database';
import { User } from '../../core/types';
import { JWTService } from '../services/jwtService';

/**
 * JWT 페이로드 인터페이스
 * 
 * JWT 토큰에 포함된 사용자 정보와 메타데이터를 정의.
 * 사용자 ID, 토큰 유형, 발급/만료 시간 등의 정보를 포함.
 */
interface JwtPayload {
  userId: number;    // 사용자 고유 식별자
  type: string;      // 토큰 유형 (access, refresh 등)
  iat?: number;      // 토큰 발급 시간 (issued at)
  exp?: number;      // 토큰 만료 시간 (expiration time)
}

/**
 * 인증된 요청 객체 인터페이스
 * 
 * Express Request 객체를 확장하여 인증된 사용자 정보를 포함.
 * 보안을 위해 비밀번호 해시는 제외하고 사용자 정보를 제공.
 */
export interface AuthRequest extends Request {
  user?: Omit<User, 'password_hash'>;  // 비밀번호를 제외한 사용자 정보
}

/**
 * JWT 토큰 인증 미들웨어 함수
 * 
 * HTTP 요청의 Authorization 헤더에서 Bearer 토큰을 추출하고 검증.
 * 유효한 토큰인 경우 사용자 정보를 데이터베이스에서 조회하여 req.user에 설정.
 * 
 * @param req - 클라이언트 HTTP 요청 객체
 * @param res - 서버 HTTP 응답 객체
 * @param next - 다음 미들웨어로 전달하는 함수
 */
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Authorization 헤더에서 Bearer 토큰 추출
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];  // 'Bearer TOKEN' 형식에서 TOKEN 부분만 추출

    if (!token) {
      return res.status(401).json({
        success: false,
        error: '액세스 토큰이 필요합니다.',
        code: 'TOKEN_REQUIRED'
      });
    }

    try {
      // JWTService를 사용하여 토큰 검증
      const decoded = JWTService.verifyAccessToken(token);
      
      // 사용자 정보 조회
      const result = await pool.query(
        `SELECT id, email, name, profile_picture, phone_number, age_group, 
                bio, profile_completed, created_at, updated_at, last_login, is_active
         FROM users 
         WHERE id = $1 AND is_active = true`,
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          error: '유효하지 않은 사용자입니다.',
          code: 'USER_NOT_FOUND'
        });
      }

      req.user = {
        ...result.rows[0],
        userId: result.rows[0].id // 호환성을 위해 userId 필드 추가
      };
      next();
    } catch (jwtError) {
      // JWT 만료 또는 무효한 토큰
      return res.status(401).json({
        success: false,
        error: '토큰이 만료되었거나 유효하지 않습니다.',
        code: 'TOKEN_EXPIRED',
        needsRefresh: true
      });
    }
  } catch (error) {
    console.error('인증 오류:', error);
    return res.status(500).json({
      success: false,
      error: '인증 처리 중 오류가 발생했습니다.',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * 프로필 완성 체크 미들웨어
 * 
 * 사용자의 프로필이 완성되었는지 확인.
 *
 * @param req - Express 요청 객체
 * @param res - Express 응답 객체
 * @param next - 다음 미들웨어 함수
 */
export const requireProfileCompleted = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.profile_completed) {
    return res.status(403).json({
      success: false,
      error: '프로필 설정을 완료해야 합니다.',
      requireProfileSetup: true
    });
  }
  next();
};