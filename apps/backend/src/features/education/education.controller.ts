/**
 * 금융 교육 및 리터러시 관리 컨트롤러
 * 
 * 사용자의 금융 리터러시 향상과 재정 관리 기술 습득을 지원하는 교육 컨텐츠 관리 시스템.
 * AI 기반 개인 맞춤형 학습 경로와 단계별 교육 컨텐츠를 제공하여 사용자의 금융 역량 강화 도모.
 * 
 * 핵심 기능:
 * - 교육 컨텐츠 관리 (CRUD 작업)
 * - 난이도별/카테고리별 컨텐츠 필터링 및 검색
 * - AI 기반 개인화된 금융 조언 및 추천 시스템
 * - 사용자별 학습 진도 및 성취도 추적
 * - 상호작용 학습 및 퀴즈 시스템
 * - 교육 대시보드 및 학습 분석 데이터 제공
 * - 성취 배지 및 마일스톤 리워드 시스템
 * 
 * API 엔드포인트:
 * - GET /api/education/content - 교육 컨텐츠 목록 조회
 * - GET /api/education/content/:id - 특정 컨텐츠 상세 조회
 * - POST /api/education/progress - 학습 진도 업데이트
 * - GET /api/education/recommendations - 개인 맞춤 컨텐츠 추천
 * - GET /api/education/dashboard - 교육 대시보드 데이터
 * - POST /api/education/quiz - 퀴즈 참여 및 결과 처리
 * - GET /api/education/achievements - 성취 배지 조회
 * 
 * 컨텐츠 카테고리:
 * - 기초 금융 지식 (Basic Finance)
 * - 예산 관리 (Budget Management)
 * - 투자 기초 (Investment Basics)
 * - 대출 및 신용 관리 (Credit Management)
 * - 은퇴 계획 (Retirement Planning)
 * - 세금 및 세무 (Tax Planning)
 * - 보험 및 리스크 관리 (Insurance & Risk)
 * 
 * 개인화 기능:
 * - 사용자의 나이, 직업, 소득 수준 기반 컨텐츠 추천
 * - 현재 재정 상태 분석을 통한 맞춤형 조언
 * - 학습 진도에 따른 단계별 컨텐츠 제공
 * - 사용자 선호도 및 학습 스타일 반영
 * 
 * @author Ju Eul Park (rope-park)
 */

import { Request, Response } from 'express';
import { EducationService } from './education.service';
import { createSuccessResponse, createErrorResponse } from '../../shared/utils/response';
import logger from '../../shared/utils/logger';

/**
 * 교육 컨트롤러 클래스
 * 
 * 금융 교육 관련 API 요청을 처리하는 컨트롤러로, EducationService와 상호작용하여
 * 교육 컨텐츠 제공, 사용자 진행 상황 관리, 개인화된 조언 생성 등의 기능을 수행.
 */
export class EducationController {
  private educationService: EducationService;

  constructor() {
    this.educationService = new EducationService();
  }

  // 교육 콘텐츠 목록 조회
  getEducationContent = async (req: Request, res: Response) => {
    try {
      const { category, difficulty, page = '1', limit = '20' } = req.query;
      
      const result = await this.educationService.getEducationContent(
        category as string,
        difficulty as string,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json(createSuccessResponse(result, '교육 콘텐츠를 성공적으로 조회했습니다.'));
    } catch (error) {
      logger.error('Get education content error:', error);
      res.status(500).json(createErrorResponse('교육 콘텐츠 조회에 실패했습니다.'));
    }
  };

  // 특정 교육 콘텐츠 조회
  getContentById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const content = await this.educationService.getContentById(parseInt(id), userId);

      res.json(createSuccessResponse(content, '교육 콘텐츠를 성공적으로 조회했습니다.'));
    } catch (error) {
      logger.error('Get content by id error:', error);
      const message = error instanceof Error ? error.message : '교육 콘텐츠 조회에 실패했습니다.';
      const status = error instanceof Error && error.message.includes('찾을 수 없습니다') ? 404 : 500;
      res.status(status).json(createErrorResponse(message));
    }
  };

  // 추천 교육 콘텐츠 조회
  getFeaturedContent = async (req: Request, res: Response) => {
    try {
      const content = await this.educationService.getFeaturedContent();

      res.json(createSuccessResponse(content, '추천 교육 콘텐츠를 성공적으로 조회했습니다.'));
    } catch (error) {
      logger.error('Get featured content error:', error);
      res.status(500).json(createErrorResponse('추천 교육 콘텐츠 조회에 실패했습니다.'));
    }
  };

  // 교육 콘텐츠 검색
  searchContent = async (req: Request, res: Response) => {
    try {
      const { q: searchTerm } = req.query;

      if (!searchTerm) {
        return res.status(400).json(createErrorResponse('검색어를 입력해주세요.'));
      }

      const content = await this.educationService.searchContent(searchTerm as string);

      res.json(createSuccessResponse(content, '교육 콘텐츠 검색을 성공적으로 완료했습니다.'));
    } catch (error) {
      logger.error('Search content error:', error);
      res.status(500).json(createErrorResponse('교육 콘텐츠 검색에 실패했습니다.'));
    }
  };

  // 사용자 진행 상황 업데이트
  updateProgress = async (req: Request, res: Response) => {
    try {
      const { contentId } = req.params;
      const userId = req.user!.id;
      const progressData = req.body;

      const progress = await this.educationService.updateUserProgress(
        userId,
        parseInt(contentId),
        progressData
      );

      res.json(createSuccessResponse(progress, '진행 상황이 성공적으로 업데이트되었습니다.'));
    } catch (error) {
      logger.error('Update progress error:', error);
      res.status(500).json(createErrorResponse('진행 상황 업데이트에 실패했습니다.'));
    }
  };

  // 사용자 교육 요약 정보
  getEducationSummary = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      const summary = await this.educationService.getUserEducationSummary(userId);

      res.json(createSuccessResponse(summary, '교육 요약 정보를 성공적으로 조회했습니다.'));
    } catch (error) {
      logger.error('Get education summary error:', error);
      res.status(500).json(createErrorResponse('교육 요약 정보 조회에 실패했습니다.'));
    }
  };

  // 재정 건강도 점수 조회
  getHealthScore = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      const healthScore = await this.educationService.calculateAndGetHealthScore(userId);

      res.json(createSuccessResponse(healthScore, '재정 건강도 점수를 성공적으로 조회했습니다.'));
    } catch (error) {
      logger.error('Get health score error:', error);
      res.status(500).json(createErrorResponse('재정 건강도 점수 조회에 실패했습니다.'));
    }
  };

  // 재정 건강도 점수 이력 조회
  getHealthScoreHistory = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      const history = await this.educationService.getHealthScoreHistory(userId);

      res.json(createSuccessResponse(history, '재정 건강도 점수 이력을 성공적으로 조회했습니다.'));
    } catch (error) {
      logger.error('Get health score history error:', error);
      res.status(500).json(createErrorResponse('재정 건강도 점수 이력 조회에 실패했습니다.'));
    }
  };

  // 절약 팁 조회
  getSavingTips = async (req: Request, res: Response) => {
    try {
      const { category, difficulty, personalized } = req.query;
      const userId = req.user?.id;

      let tips;
      if (personalized === 'true' && userId) {
        tips = await this.educationService.getPersonalizedSavingTips(userId);
      } else {
        tips = await this.educationService.getSavingTips(
          category as string,
          difficulty as string
        );
      }

      res.json(createSuccessResponse(tips, '절약 팁을 성공적으로 조회했습니다.'));
    } catch (error) {
      logger.error('Get saving tips error:', error);
      res.status(500).json(createErrorResponse('절약 팁 조회에 실패했습니다.'));
    }
  };

  // 절약 팁 평가
  rateSavingTip = async (req: Request, res: Response) => {
    try {
      const { tipId } = req.params;
      const { isHelpful, feedback } = req.body;
      const userId = req.user!.id;

      await this.educationService.markTipAsHelpful(
        userId,
        parseInt(tipId),
        isHelpful,
        feedback
      );

      res.json(createSuccessResponse(null, '절약 팁 평가가 성공적으로 저장되었습니다.'));
    } catch (error) {
      logger.error('Rate saving tip error:', error);
      res.status(500).json(createErrorResponse('절약 팁 평가 저장에 실패했습니다.'));
    }
  };

  // 개인화된 조언 조회
  getPersonalizedAdvice = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      const advice = await this.educationService.getPersonalizedAdvice(userId);

      res.json(createSuccessResponse(advice, '개인화된 조언을 성공적으로 조회했습니다.'));
    } catch (error) {
      logger.error('Get personalized advice error:', error);
      res.status(500).json(createErrorResponse('개인화된 조언 조회에 실패했습니다.'));
    }
  };

  // 개인화된 조언 생성
  generateAdvice = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      const advice = await this.educationService.generateAdviceForUser(userId);

      res.json(createSuccessResponse(advice, '개인화된 조언이 성공적으로 생성되었습니다.'));
    } catch (error) {
      logger.error('Generate advice error:', error);
      res.status(500).json(createErrorResponse('개인화된 조언 생성에 실패했습니다.'));
    }
  };

  // 조언 읽음 처리
  markAdviceAsRead = async (req: Request, res: Response) => {
    try {
      const { adviceId } = req.params;
      const userId = req.user!.id;

      await this.educationService.markAdviceAsRead(userId, parseInt(adviceId));

      res.json(createSuccessResponse(null, '조언이 읽음 처리되었습니다.'));
    } catch (error) {
      logger.error('Mark advice as read error:', error);
      res.status(500).json(createErrorResponse('조언 읽음 처리에 실패했습니다.'));
    }
  };

  // 조언 해제
  dismissAdvice = async (req: Request, res: Response) => {
    try {
      const { adviceId } = req.params;
      const userId = req.user!.id;

      await this.educationService.dismissAdvice(userId, parseInt(adviceId));

      res.json(createSuccessResponse(null, '조언이 해제되었습니다.'));
    } catch (error) {
      logger.error('Dismiss advice error:', error);
      res.status(500).json(createErrorResponse('조언 해제에 실패했습니다.'));
    }
  };

  // 교육 대시보드 조회
  getEducationDashboard = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      const dashboard = await this.educationService.getEducationDashboard(userId);

      res.json(createSuccessResponse(dashboard, '교육 대시보드를 성공적으로 조회했습니다.'));
    } catch (error) {
      logger.error('Get education dashboard error:', error);
      res.status(500).json(createErrorResponse('교육 대시보드 조회에 실패했습니다.'));
    }
  };
}
