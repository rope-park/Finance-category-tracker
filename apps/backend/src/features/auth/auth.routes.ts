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

// 회원가입
router.post('/register', registerLimiter, validateRegister, register);

// 로그인  
router.post('/login', authLimiter, validateLogin, login);

// 토큰 갱신
router.post('/refresh', authLimiter, refreshToken);

// 로그아웃 (현재 세션)
router.post('/logout', authLimiter, logout);

// 전체 로그아웃 (모든 세션)
router.post('/logout-all', authenticateToken, logoutAll);

// 활성 세션 조회
router.get('/sessions', authenticateToken, getActiveSessions);

// 현재 사용자 정보 조회
router.get('/me', authenticateToken, getCurrentUser);

// 토큰 검증
router.get('/verify', authenticateToken, verifyToken);

export default router;
