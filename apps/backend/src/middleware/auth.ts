import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { User } from '../types';

interface JwtPayload {
  userId: number;
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
        error: '액세스 토큰이 필요합니다.'
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
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
        error: '유효하지 않은 사용자입니다.'
      });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('인증 오류:', error);
    return res.status(403).json({
      success: false,
      error: '유효하지 않은 토큰입니다.'
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