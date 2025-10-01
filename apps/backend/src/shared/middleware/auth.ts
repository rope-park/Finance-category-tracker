import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import pool from '../../core/config/database';
import { User } from '../../core/types';
import { JWTService } from '../services/jwtService';

interface JwtPayload {
  userId: number;
  type: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: Omit<User, 'password_hash'>;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

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

// 프로필 완성 체크 미들웨어
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