import express from 'express';
import { register, login, getCurrentUser, verifyToken } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validateRegisterData, validateLoginData } from '../middleware/validation';

const router = express.Router();

// 회원가입 (데이터 검증 포함)
router.post('/register', validateRegisterData, register);

// 로그인 (데이터 검증 포함)
router.post('/login', validateLoginData, login);

// 현재 사용자 정보 (인증 필요)
router.get('/me', authenticateToken, getCurrentUser);

// 토큰 검증 (인증 필요)
router.get('/verify', authenticateToken, verifyToken);

export default router;