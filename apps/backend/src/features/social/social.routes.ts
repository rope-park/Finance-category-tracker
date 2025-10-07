/**
 * 소셜 기능 API 라우트
 * 
 * 가족 그룹 생성/관리, 공유 목표 설정, 가족 구성원 관리 등
 * 소셜 예산 관리 기능을 위한 REST API 엔드포인트들 제공함.
 * 
 * 주요 기능:
 * - 가족/그룹 생성 및 조회
 * - 구성원 초대 및 응답 처리
 * - 공유 목표 생성 및 기여
 * - 가족 거래 내역 관리
 * - 가족 대시보드 데이터 제공
 * 
 * @author Ju Eul Park (rope-park)
 */

import { Router } from 'express';
import { SocialController } from './social.controller';
import { authenticateToken } from '../../shared/middleware/auth';

const router = Router();

// 전체 라우트에 인증 미들웨어 적용 (가족/그룹 단위 기능이므로 인증 필요)
router.use(authenticateToken);

// ==================================================
// 가족 그룹 관리 API
// ==================================================

/**
 * POST api/social/families
 * 새로운 가족 그룹 생성
 * 
 * 사용자가 속한 새로운 가족 그룹을 생성하고, 해당 그룹의 관리자로 설정
 * 
 * @route POST /api/social/families
 * @access Private (인증 필요)
 */
router.post('/families', SocialController.createFamily);

/**
 * GET /api/social/families
 * 사용자가 속한 가족 그룹 목록 조회
 * 
 * 현재 사용자가 속한 모든 가족 그룹의 목록을 반환
 * 
 * @route GET /api/social/families
 * @access Private (인증 필요)
 */
router.get('/families', SocialController.getUserFamilies);

/**
 * GET /api/social/families/:familyId
 * 특정 가족 그룹 상세 정보 조회
 * 
 * @route GET /api/social/families/:familyId
 * @access Private (인증 필요, 해당 가족 구성원만)
 */
router.get('/families/:familyId', SocialController.getFamilyById);

// ==================================================
// 가족 구성원 관리 API
// ==================================================

/**
 * POST /api/social/families/:familyId/invite
 * 가족 구성원 초대
 * 
 * @route POST /api/social/families/:familyId/invite
 * @access Private (가족 관리자만)
 */
router.post('/families/:familyId/invite', SocialController.inviteFamilyMember);

/**
 * PATCH /api/social/family-members/:memberId/respond
 * 가족 초대에 대한 응답 처리
 * 
 * @route PATCH /api/social/family-members/:memberId/respond
 * @access Private (초대받은 사용자만)
 */
router.patch('/family-members/:memberId/respond', SocialController.respondToInvitation);

// ==================================================
// 공유 목표 관리 API
// ==================================================

/**
 * POST /api/social/shared-goals
 * 새로운 공유 목표 생성
 * @route POST /api/social/shared-goals
 * @access Private (가족 구성원만)
 */
router.post('/shared-goals', SocialController.createSharedGoal);

/**
 * GET /api/social/families/:familyId/goals
 * 가족 그룹의 공유 목표 목록 조회
 * 
 * @route GET /api/social/families/:familyId/goals
 * @access Private (가족 구성원만)
 */
router.get('/families/:familyId/goals', SocialController.getFamilyGoals);

/**
 * POST /api/social/shared-goals/:goalId/contribute
 * 공유 목표에 기여금 추가
 * 
 * @route POST /api/social/shared-goals/:goalId/contribute
 * @access Private (가족 구성원만)
 */
router.post('/shared-goals/:goalId/contribute', SocialController.contributeToGoal);

// ==================================================
// 가족 거래 내역 관리 API
// ==================================================

/**
 * POST /api/social/family-transactions
 * 가족 공용 거래 내역 생성
 * 
 * @route POST /api/social/family-transactions
 * @access Private (가족 구성원만)
 */
router.post('/family-transactions', SocialController.createFamilyTransaction);

/**
 * GET /api/social/family-transactions
 * 가족 그룹의 거래 내역 조회
 * 
 * @route GET /api/social/families/:familyId/transactions
 * @access Private (가족 구성원만)
 */
router.get('/families/:familyId/transactions', SocialController.getFamilyTransactions);

// ==================================================
// 가족 대시보드 API
// ==================================================

/**
 * GET /api/social/family-transactions
 * 가족 그룹의 거래 내역 조회
 *
 * @route GET /api/social/families/:familyId/transactions
 * @access Private (가족 구성원만)
 */
router.get('/families/:familyId/dashboard', SocialController.getFamilyDashboard);

export default router;
