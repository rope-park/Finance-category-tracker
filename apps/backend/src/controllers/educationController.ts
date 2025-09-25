import { Request, Response } from 'express';
import { EducationService } from '../services/educationService';
import { createSuccessResponse, createErrorResponse } from '../utils/response';
import logger from '../utils/logger';

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
