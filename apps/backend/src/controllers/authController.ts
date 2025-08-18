import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { CreateUserRequest, LoginRequest, AuthResponse, ApiResponse } from '../types';
import { AuthRequest } from '../middleware/auth';

// JWT 서명 함수 (타입 안전)
const signJWT = (payload: object, secret: string, expiresIn: string): string => {
  return (jwt as any).sign(payload, secret, { expiresIn });
};

// 회원가입
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name }: CreateUserRequest = req.body;

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

    // JWT 토큰 생성
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }
    
    const token = signJWT(
      { userId: user.id, email: user.email },
      jwtSecret,
      process.env.JWT_EXPIRES_IN || '7d'
    );

    const response: ApiResponse<AuthResponse> = {
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
        token
      },
      message: '회원가입이 완료되었습니다.'
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

// 로그인
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe }: LoginRequest = req.body;

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

    // 로그인 함수 내에서도 JWT 수정
    const expiresIn = rememberMe ? '30d' : '7d';
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const payload = { userId: user.id, email: user.email };
    const token = signJWT(payload, jwtSecret, expiresIn);

    // password_hash 제거
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user;

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        user: {
          ...userWithoutPassword,
          last_login: new Date()
        },
        token
      },
      message: '로그인이 완료되었습니다.'
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

// 현재 사용자 정보 조회
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const response: ApiResponse = {
      success: true,
      data: { user: req.user },
      message: '사용자 정보를 조회했습니다.'
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

// 토큰 검증
export const verifyToken = async (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: { valid: true, user: req.user },
    message: '토큰이 유효합니다.'
  });
};