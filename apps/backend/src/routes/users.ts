import express from 'express';
import { 
  updateProfile, 
  deleteUser, 
  getUserSettings, 
  updateUserSettings 
} from '../controllers/userController';
import { authenticateToken, requireProfileCompleted } from '../middleware/auth';
import { validateProfileData } from '../middleware/validation';

const router = express.Router();

// 프로필 업데이트 (인증 필요, 데이터 검증 포함)
router.patch('/profile', authenticateToken, validateProfileData, updateProfile);

// 사용자 삭제 (인증 필요, 프로필 완성 필요)
router.delete('/account', authenticateToken, requireProfileCompleted, deleteUser);

// 사용자 설정 조회 (인증 필요)
router.get('/settings', authenticateToken, getUserSettings);

// 사용자 설정 업데이트 (인증 필요)
router.patch('/settings', authenticateToken, updateUserSettings);

export default router;