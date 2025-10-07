/**
 * 인증 및 사용자 관리 API 라우트
 * 
 * 회원가입, 로그인, JWT 토큰 관리, 세션 관리 등 인증 관련 모든 RESTful API 엔드포인트를 제공.
 * 보안 강화를 위한 다양한 미들웨어 적용.
 * 
 * 주요 기능:
 * - 회원가입과 로그인 처리
 * - JWT 액세스/리프레시 토큰 관리
 * - 다중 세션 관리 및 보안 로그아웃
 * - 비밀번호 리셋 및 계정 보안 기능
 * 
 * @author Ju Eul Park (rope-park)
 */

import * as express from 'express';
import { authenticateToken } from '../../shared/middleware/auth';
import { authLimiter, registerLimiter, strictLimiter } from '../../shared/middleware/rateLimiter';
import { validateRegister, validateLogin } from '../../shared/middleware/security';
import { 
  register, 
  login, 
  refreshToken,
  logout,
  logoutAll,
  getActiveSessions,
  getCurrentUser, 
  verifyToken 
} from './auth.controller';

const router = express.Router();

/**
 * POST /api/auth/register
 * 사용자 회원가입 API
 * 
 * 새로운 사용자 계정 생성하고 초기 설정 진행.
 * 이메일 중복 검사, 비밀번호 암호화, 입력 데이터 유효성 검사 포함.
 * 
 * @route POST /api/auth/register
 * @access Public
 * @rateLimit 회원가입 전용 제한된 빈도 제한 적용
 */
router.post('/register', registerLimiter, validateRegister, register);

/**
 * POST /api/auth/login
 * 사용자 로그인 API
 * 
 * 이메일과 비밀번호를 사용한 인증 및 JWT 토큰 발급.
 * 로그인 시도 제한, 계정 잠금 보안 기능 적용.
 * 
 * @route POST /api/auth/login
 * @access Public
 * @rateLimit 인증 요청에 대한 제한된 빈도 제한 적용
 */
router.post('/login', authLimiter, validateLogin, login);

/**
 * POST /api/auth/refresh
 * JWT 액세스 토큰 갱신 API
 * 
 * 만료된 액세스 토큰을 리프레시 토큰 사용하여 갱신.
 * 보안성을 위해 리프레시 토큰 순환 및 유효성 검사 수행.
 * 
 * @route POST /api/auth/refresh
 * @access Public (리프레시 토큰 필요)
 * @rateLimit 인증 요청에 대한 제한된 빈도 제한 적용
 */
router.post('/refresh', authLimiter, refreshToken);

/**
 * POST /api/auth/logout
 * 현재 세션 로그아웃 API
 * 
 * 현재 활성화된 세션을 종료하고 해당 JWT 토큰 무효화.
 * 보안 로그아웃을 통해 세션 탈취 위험 감소.
 * 
 * @route POST /api/auth/logout
 * @access Private (인증 필요)
 * @rateLimit 엄격한 빈도 제한 적용
 */
router.post('/logout', authLimiter, logout);

/**
 * POST /api/auth/logout-all
 * 전체 로그아웃 API
 *
 * 모든 활성 세션을 종료하고 해당 JWT 토큰 무효화.
 * 보안 로그아웃을 통해 세션 탈취 위험 감소.
 *
 * @route POST /api/auth/logout-all
 * @access Private (인증 필요)
 * @rateLimit 엄격한 빈도 제한 적용
 */
router.post('/logout-all', authenticateToken, logoutAll);

/**
 * GET /api/auth/sessions
 * 활성 세션 조회 API
 * 
 * 사용자의 모든 활성 세션 목록을 조회.
 * 각 세션의 로그인 시간, IP 주소, 기기 정보 등을 포함.
 * 
 * @route GET /api/auth/sessions
 * @access Private (인증 필요)
 * @rateLimit 엄격한 빈도 제한 적용
 */
router.get('/sessions', authenticateToken, getActiveSessions);

/**
 * GET /api/auth/me
 * 현재 사용자 정보 조회 API
 * 
 * 인증된 사용자의 프로필 정보를 반환.
 * 
 * @route GET /api/auth/me
 * @access Private (인증 필요)
 * @rateLimit 엄격한 빈도 제한 적용
 */
router.get('/me', authenticateToken, getCurrentUser);

/**
 * GET /api/auth/verify
 * 토큰 검증 API
 * 
 * @route GET /api/auth/verify
 * @access Private (인증 필요)
 * @rateLimit 엄격한 빈도 제한 적용
 */
router.get('/verify', authenticateToken, verifyToken);

export default router;
