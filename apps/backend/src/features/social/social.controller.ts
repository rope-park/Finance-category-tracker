/**
 * 소셜 기능 관리 컨트롤러
 * 
 * 가족, 친구, 커뮤니티 간의 소셜 기능을 관리하는 핵심 컨트롤러.
 * 개인정보 보호를 최우선으로 하면서 사용자 간 소통과 경험 공유를 지원.
 * 적절한 데이터 익명화와 권한 관리를 통해 안전한 소셜 환경을 제공.
 * 
 * 핵심 기능:
 * - 가족 그룹 생성 및 관리 (Family Group Management)
 * - 친구 관계 관리 (Friend Relationships)
 * - 지출 패턴 공유 및 비교 (Spending Pattern Sharing)
 * - 절약 챌린지 및 게임화 기능 (Savings Challenges)
 * - 소셜 랭킹 및 순위 시스템 (Social Ranking)
 * - 실시간 소셜 알림 처리 (Social Notifications)
 * - 커뮤니티 기반 재정 목표 공유 (Community Goals)
 * 
 * API 엔드포인트:
 * - POST /api/social/family - 가족 그룹 생성
 * - GET /api/social/friends - 친구 목록 조회
 * - POST /api/social/friends/invite - 친구 초대
 * - GET /api/social/challenges - 챌린지 목록 조회
 * - POST /api/social/share - 지출 패턴 공유
 * - GET /api/social/rankings - 소셜 랭킹 조회
 * - POST /api/social/notifications - 알림 설정 관리
 * 
 * 보안 및 개인정보 보호:
 * - 모든 공유 데이터의 익명화 처리
 * - 개인 금융 정보의 선택적 공개 설정
 * - 가족/친구 간 적절한 접근 권한 관리
 * - 민감한 거래 내역의 자동 필터링
 * - GDPR 및 개인정보보호법 준수
 * 
 * @author Ju Eul Park (rope-park)
 */

import { Request, Response } from 'express';
import { SocialService } from './social.service';

/**
 * 소셜 기능 관리 컨트롤러
 * 
 * 가족, 친구, 커뮤니티 간의 소셜 기능을 관리하는 핵심 컨트롤러.
 */
export class SocialController {
  // 가족 그룹 생성
  static async createFamily(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      // 기본 유효성 검사
      const { name } = req.body;
      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: '가족 이름을 입력해주세요'
        });
      }

      const family = await SocialService.createFamily(userId, req.body);
      
      res.status(201).json({
        success: true,
        data: family,
        message: '가족 그룹이 성공적으로 생성되었습니다'
      });
    } catch (error) {
      console.error('Create family error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '가족 그룹 생성에 실패했습니다'
      });
    }
  }

  // 사용자의 가족 목록 조회
  static async getUserFamilies(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const families = await SocialService.getUserFamilies(userId);
      
      res.json({
        success: true,
        data: families
      });
    } catch (error) {
      console.error('Get user families error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '가족 목록 조회에 실패했습니다'
      });
    }
  }

  // 가족 정보 조회
  static async getFamilyById(req: Request, res: Response) {
    try {
      const familyId = parseInt(req.params.familyId);
      if (isNaN(familyId)) {
        return res.status(400).json({
          success: false,
          error: '유효한 가족 ID를 입력해주세요'
        });
      }

      const family = await SocialService.getFamilyById(familyId);
      
      res.json({
        success: true,
        data: family
      });
    } catch (error) {
      console.error('Get family by id error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '가족 정보 조회에 실패했습니다'
      });
    }
  }

  // 가족 구성원 초대
  static async inviteFamilyMember(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const familyId = parseInt(req.params.familyId);
      if (isNaN(familyId)) {
        return res.status(400).json({
          success: false,
          error: '유효한 가족 ID를 입력해주세요'
        });
      }

      const { email } = req.body;
      if (!email || !email.includes('@')) {
        return res.status(400).json({
          success: false,
          error: '유효한 이메일을 입력해주세요'
        });
      }

      const invitation = await SocialService.inviteFamilyMember(familyId, userId, req.body);
      
      res.status(201).json({
        success: true,
        data: invitation,
        message: '구성원 초대가 전송되었습니다'
      });
    } catch (error) {
      console.error('Invite family member error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '구성원 초대에 실패했습니다'
      });
    }
  }

  // 초대 응답
  static async respondToInvitation(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const memberId = parseInt(req.params.memberId);
      if (isNaN(memberId)) {
        return res.status(400).json({
          success: false,
          error: '유효한 멤버 ID를 입력해주세요'
        });
      }

      const { response } = req.body;
      if (!response || !['accepted', 'declined'].includes(response)) {
        return res.status(400).json({
          success: false,
          error: '유효한 응답을 선택해주세요'
        });
      }
      
      const member = await SocialService.respondToInvitation(memberId, userId, response);
      
      res.json({
        success: true,
        data: member,
        message: response === 'accepted' ? '초대를 수락했습니다' : '초대를 거절했습니다'
      });
    } catch (error) {
      console.error('Respond to invitation error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '초대 응답에 실패했습니다'
      });
    }
  }

  // 공유 목표 생성
  static async createSharedGoal(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const { familyId, title, targetAmount, category, targetDate } = req.body;
      
      // 기본 유효성 검사
      if (!familyId || !title || !targetAmount || !category || !targetDate) {
        return res.status(400).json({
          success: false,
          error: '필수 필드를 모두 입력해주세요'
        });
      }

      const goalData = {
        familyId: parseInt(familyId),
        createdBy: userId,
        title,
        targetAmount: parseFloat(targetAmount),
        category,
        targetDate: new Date(targetDate),
        description: req.body.description
      };
      
      const goal = await SocialService.createSharedGoal(goalData);
      
      res.status(201).json({
        success: true,
        data: goal,
        message: '공유 목표가 생성되었습니다'
      });
    } catch (error) {
      console.error('Create shared goal error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '공유 목표 생성에 실패했습니다'
      });
    }
  }

  // 목표에 기여하기
  static async contributeToGoal(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const goalId = parseInt(req.params.goalId);
      if (isNaN(goalId)) {
        return res.status(400).json({
          success: false,
          error: '유효한 목표 ID를 입력해주세요'
        });
      }

      const { amount } = req.body;
      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({
          success: false,
          error: '유효한 기여 금액을 입력해주세요'
        });
      }

      const contribution = await SocialService.contributeToGoal(goalId, userId, {
        amount: parseFloat(amount),
        note: req.body.note
      });
      
      res.status(201).json({
        success: true,
        data: contribution,
        message: '목표에 성공적으로 기여했습니다'
      });
    } catch (error) {
      console.error('Contribute to goal error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '목표 기여에 실패했습니다'
      });
    }
  }

  // 가족 목표 목록 조회
  static async getFamilyGoals(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const familyId = parseInt(req.params.familyId);
      if (isNaN(familyId)) {
        return res.status(400).json({
          success: false,
          error: '유효한 가족 ID를 입력해주세요'
        });
      }

      const goals = await SocialService.getFamilyGoals(familyId, userId);
      
      res.json({
        success: true,
        data: goals
      });
    } catch (error) {
      console.error('Get family goals error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '가족 목표 조회에 실패했습니다'
      });
    }
  }

  // 가족 거래 생성
  static async createFamilyTransaction(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const { familyId, type, amount, description, category, date } = req.body;
      
      // 기본 유효성 검사
      if (!familyId || !type || !amount || !description || !category || !date) {
        return res.status(400).json({
          success: false,
          error: '필수 필드를 모두 입력해주세요'
        });
      }

      const transactionData = {
        familyId: parseInt(familyId),
        userId,
        type,
        amount: parseFloat(amount),
        description,
        category,
        date: new Date(date),
        splitDetails: req.body.splitDetails
      };
      
      const transaction = await SocialService.createFamilyTransaction(transactionData);
      
      res.status(201).json({
        success: true,
        data: transaction,
        message: '가족 거래가 생성되었습니다'
      });
    } catch (error) {
      console.error('Create family transaction error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '가족 거래 생성에 실패했습니다'
      });
    }
  }

  // 가족 거래 목록 조회
  static async getFamilyTransactions(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const familyId = parseInt(req.params.familyId);
      if (isNaN(familyId)) {
        return res.status(400).json({
          success: false,
          error: '유효한 가족 ID를 입력해주세요'
        });
      }

      const filters = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        category: req.query.category as string,
        type: req.query.type as 'income' | 'expense'
      };
      
      const result = await SocialService.getFamilyTransactions(familyId, userId, filters);
      
      res.json({
        success: true,
        data: result.transactions,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: result.total,
          pages: Math.ceil(result.total / filters.limit)
        }
      });
    } catch (error) {
      console.error('Get family transactions error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '가족 거래 조회에 실패했습니다'
      });
    }
  }

  // 가족 대시보드
  static async getFamilyDashboard(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const familyId = parseInt(req.params.familyId);
      if (isNaN(familyId)) {
        return res.status(400).json({
          success: false,
          error: '유효한 가족 ID를 입력해주세요'
        });
      }

      const dashboard = await SocialService.getFamilyDashboard(familyId, userId);
      
      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      console.error('Get family dashboard error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '가족 대시보드 조회에 실패했습니다'
      });
    }
  }
}
