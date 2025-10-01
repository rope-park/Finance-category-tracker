import { EducationRepository, EducationContent, UserEducationProgress, FinancialHealthScore, SavingTip, PersonalizedAdvice } from './education.repository';
import logger from '../../shared/utils/logger';

export class EducationService {
  private educationRepository: EducationRepository;

  constructor() {
    this.educationRepository = new EducationRepository();
  }

  // 교육 콘텐츠 관련 서비스
  async getEducationContent(
    category?: string, 
    difficulty?: string, 
    page = 1, 
    limit = 20
  ): Promise<{ content: EducationContent[], total: number, hasMore: boolean }> {
    try {
      const offset = (page - 1) * limit;
      const content = await this.educationRepository.getAllContent(category, difficulty, limit + 1, offset);
      
      const hasMore = content.length > limit;
      const actualContent = hasMore ? content.slice(0, limit) : content;

      return {
        content: actualContent,
        total: actualContent.length,
        hasMore
      };
    } catch (error) {
      logger.error('Failed to get education content:', error);
      throw new Error('교육 콘텐츠를 가져오는데 실패했습니다.');
    }
  }

  async getContentById(id: number, userId?: number): Promise<EducationContent & { userProgress?: UserEducationProgress }> {
    try {
      const content = await this.educationRepository.getContentById(id);
      if (!content) {
        throw new Error('콘텐츠를 찾을 수 없습니다.');
      }

      let userProgress;
      if (userId) {
        const progressList = await this.educationRepository.getUserProgress(userId, id);
        userProgress = progressList[0];
      }

      return {
        ...content,
        userProgress
      };
    } catch (error) {
      logger.error('Failed to get content by id:', error);
      throw error;
    }
  }

  async getFeaturedContent(): Promise<EducationContent[]> {
    try {
      return await this.educationRepository.getFeaturedContent();
    } catch (error) {
      logger.error('Failed to get featured content:', error);
      throw new Error('추천 콘텐츠를 가져오는데 실패했습니다.');
    }
  }

  async searchContent(searchTerm: string): Promise<EducationContent[]> {
    try {
      if (!searchTerm.trim()) {
        throw new Error('검색어를 입력해주세요.');
      }
      
      return await this.educationRepository.searchContent(searchTerm.trim());
    } catch (error) {
      logger.error('Failed to search content:', error);
      throw new Error('콘텐츠 검색에 실패했습니다.');
    }
  }

  // 사용자 진행 상황 관련 서비스
  async updateUserProgress(
    userId: number, 
    contentId: number, 
    progressData: {
      reading_progress?: number;
      time_spent_minutes?: number;
      is_completed?: boolean;
      quiz_score?: number;
      rating?: number;
      bookmarked?: boolean;
    }
  ): Promise<UserEducationProgress> {
    try {
      // 진행률이 100%이면 완료로 표시
      if (progressData.reading_progress === 100) {
        progressData.is_completed = true;
      }

      const progress = await this.educationRepository.updateProgress(userId, contentId, {
        ...progressData,
        completion_date: progressData.is_completed ? new Date() : undefined
      });

      logger.info(`User ${userId} updated progress for content ${contentId}`, progressData);
      return progress;
    } catch (error) {
      logger.error('Failed to update user progress:', error);
      throw new Error('진행 상황 업데이트에 실패했습니다.');
    }
  }

  async getUserEducationSummary(userId: number): Promise<{
    totalContent: number;
    completedContent: number;
    totalTimeSpent: number;
    averageRating: number;
    bookmarkedCount: number;
    recentProgress: UserEducationProgress[];
  }> {
    try {
      const allProgress = await this.educationRepository.getUserProgress(userId);
      
      const summary = {
        totalContent: allProgress.length,
        completedContent: allProgress.filter(p => p.is_completed).length,
        totalTimeSpent: allProgress.reduce((sum, p) => sum + p.time_spent_minutes, 0),
        averageRating: allProgress.filter(p => p.rating).length > 0 
          ? allProgress.filter(p => p.rating).reduce((sum, p) => sum + (p.rating || 0), 0) / allProgress.filter(p => p.rating).length
          : 0,
        bookmarkedCount: allProgress.filter(p => p.bookmarked).length,
        recentProgress: allProgress.slice(0, 5) // 최근 5개
      };

      return summary;
    } catch (error) {
      logger.error('Failed to get user education summary:', error);
      throw new Error('교육 요약 정보를 가져오는데 실패했습니다.');
    }
  }

  // 재정 건강도 점수 관련 서비스
  async calculateAndGetHealthScore(userId: number): Promise<FinancialHealthScore> {
    try {
      // 최근 점수가 있는지 확인 (1일 이내)
      const latestScore = await this.educationRepository.getLatestHealthScore(userId);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      if (latestScore && latestScore.calculation_date > oneDayAgo) {
        return latestScore;
      }

      // 새로 계산
      const newScore = await this.educationRepository.calculateHealthScore(userId);
      logger.info(`Calculated financial health score for user ${userId}: ${newScore.overall_score}`);
      
      return newScore;
    } catch (error) {
      logger.error('Failed to calculate health score:', error);
      throw new Error('재정 건강도 점수 계산에 실패했습니다.');
    }
  }

  async getHealthScoreHistory(userId: number): Promise<FinancialHealthScore[]> {
    try {
      // 최근 6개월간의 점수 이력 조회
      return await this.educationRepository.getHealthScoreHistory(userId, 6);
    } catch (error) {
      logger.error('Failed to get health score history:', error);
      throw new Error('재정 건강도 점수 이력을 가져오는데 실패했습니다.');
    }
  }

  // 절약 팁 관련 서비스
  async getSavingTips(category?: string, difficulty?: string): Promise<SavingTip[]> {
    try {
      return await this.educationRepository.getSavingTips(category, difficulty);
    } catch (error) {
      logger.error('Failed to get saving tips:', error);
      throw new Error('절약 팁을 가져오는데 실패했습니다.');
    }
  }

  async getPersonalizedSavingTips(userId: number): Promise<SavingTip[]> {
    try {
      return await this.educationRepository.getPersonalizedTips(userId);
    } catch (error) {
      logger.error('Failed to get personalized saving tips:', error);
      throw new Error('맞춤형 절약 팁을 가져오는데 실패했습니다.');
    }
  }

  async markTipAsHelpful(userId: number, tipId: number, isHelpful: boolean, feedback?: string): Promise<void> {
    try {
      await this.educationRepository.markTipAsHelpful(userId, tipId, isHelpful, feedback);

      logger.info(`User ${userId} marked tip ${tipId} as ${isHelpful ? 'helpful' : 'not helpful'}`);
    } catch (error) {
      logger.error('Failed to mark tip as helpful:', error);
      throw new Error('팁 평가 저장에 실패했습니다.');
    }
  }

  // 개인화된 조언 관련 서비스
  async getPersonalizedAdvice(userId: number): Promise<PersonalizedAdvice[]> {
    try {
      return await this.educationRepository.getPersonalizedAdvice(userId);
    } catch (error) {
      logger.error('Failed to get personalized advice:', error);
      throw new Error('개인화된 조언을 가져오는데 실패했습니다.');
    }
  }

  async generateAdviceForUser(userId: number): Promise<PersonalizedAdvice[]> {
    try {
      return await this.educationRepository.generatePersonalizedAdvice(userId);
    } catch (error) {
      logger.error('Failed to generate advice:', error);
      throw new Error('개인화된 조언 생성에 실패했습니다.');
    }
  }

  async markAdviceAsRead(userId: number, adviceId: number): Promise<void> {
    try {
      await this.educationRepository.markAdviceAsRead(userId, adviceId);

      logger.info(`User ${userId} marked advice ${adviceId} as read`);
    } catch (error) {
      logger.error('Failed to mark advice as read:', error);
      throw new Error('조언 읽음 처리에 실패했습니다.');
    }
  }

  async dismissAdvice(userId: number, adviceId: number): Promise<void> {
    try {
      await this.educationRepository.dismissAdvice(userId, adviceId);

      logger.info(`User ${userId} dismissed advice ${adviceId}`);
    } catch (error) {
      logger.error('Failed to dismiss advice:', error);
      throw new Error('조언 해제에 실패했습니다.');
    }
  }

  // 통합 대시보드 데이터
  async getEducationDashboard(userId: number): Promise<{
    healthScore: FinancialHealthScore;
    recentAdvice: PersonalizedAdvice[];
    personalizedTips: SavingTip[];
    featuredContent: EducationContent[];
    educationSummary: any;
  }> {
    try {
      const [healthScore, recentAdvice, personalizedTips, featuredContent, educationSummary] = await Promise.all([
        this.calculateAndGetHealthScore(userId),
        this.getPersonalizedAdvice(userId),
        this.getPersonalizedSavingTips(userId),
        this.getFeaturedContent(),
        this.getUserEducationSummary(userId)
      ]);

      return {
        healthScore,
        recentAdvice: recentAdvice.slice(0, 3), // 최대 3개
        personalizedTips: personalizedTips.slice(0, 5), // 최대 5개
        featuredContent: featuredContent.slice(0, 3), // 최대 3개
        educationSummary
      };
    } catch (error) {
      logger.error('Failed to get education dashboard:', error);
      throw new Error('교육 대시보드 데이터를 가져오는데 실패했습니다.');
    }
  }
}
