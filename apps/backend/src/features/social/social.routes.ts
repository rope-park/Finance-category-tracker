import { Router } from 'express';
import { SocialController } from './social.controller';
import { authenticateToken } from '../../shared/middleware/auth';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 가족 관리
router.post('/families', SocialController.createFamily);
router.get('/families', SocialController.getUserFamilies);
router.get('/families/:familyId', SocialController.getFamilyById);

// 가족 구성원 관리
router.post('/families/:familyId/invite', SocialController.inviteFamilyMember);
router.patch('/family-members/:memberId/respond', SocialController.respondToInvitation);

// 공유 목표 관리
router.post('/shared-goals', SocialController.createSharedGoal);
router.get('/families/:familyId/goals', SocialController.getFamilyGoals);
router.post('/shared-goals/:goalId/contribute', SocialController.contributeToGoal);

// 가족 거래 관리
router.post('/family-transactions', SocialController.createFamilyTransaction);
router.get('/families/:familyId/transactions', SocialController.getFamilyTransactions);

// 대시보드
router.get('/families/:familyId/dashboard', SocialController.getFamilyDashboard);

export default router;
