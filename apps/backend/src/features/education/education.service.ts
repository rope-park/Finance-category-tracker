/**
 * 금융 교육 콘텐츠 서비스
 * 
 * 사용자의 금융 리터러시 향상을 위한 교육 콘텐츠와 개인화된 재정 조언 제공.
 * 예산 관리, 저축, 투자 등 다양한 금융 주제에 대한 체계적이고 실용적인 교육 제공.
 * 
 * 주요 기능:
 * - 단계별 금융 교육 콘텐츠 제공
 * - 사용자 맞춤형 재정 조언 및 팁
 * - 금융 건전성 지수 평가 및 모니터링
 * - 학습 진척도 추적 및 성취 인증
 * 
 * @author Ju Eul Park (rope-park)
 */

import { EducationRepository, EducationContent, UserEducationProgress, FinancialHealthScore, SavingTip, PersonalizedAdvice } from './education.repository';
import logger from '../../shared/utils/logger';

/**
 * 금융 교육 서비스 비즈니스 로직 클래스
 * 
 * Repository 패턴을 사용하여 데이터 접근과 비즈니스 로직을 분리.
 * 금융 교육 콘텐츠와 개인화된 조언 생성을 담당하는 서비스 레이어.
 */
export class EducationService {
  private educationRepository: EducationRepository;

  constructor() {
    this.educationRepository = new EducationRepository();
  }

  /**
   * 금융 교육 콘텐츠 목록 조회 (필터링 및 페이지네이션 지원)
   * @param category - 교육 콘텐츠 카테고리 (예산, 저축, 투자 등)
   * @param difficulty - 난이도 레벨 (beginner, intermediate, advanced)
   * @param page - 페이지 번호 (기본값: 1)
   * @param limit - 페이지당 콘텐츠 수 (기본값: 20)
   * @returns 교육 콘텐츠 목록과 페이지네이션 정보
   */
  async getEducationContent(
    category?: string, 
    difficulty?: string, 
    page = 1, 
    limit = 20
  ): Promise<{ content: EducationContent[], total: number, hasMore: boolean }> {
    try {
      // 페이지네이션을 위한 offset 계산
      const offset = (page - 1) * limit;
      
      // 다음 페이지 존재 여부 확인을 위해 limit + 1로 요청
      const content = await this.educationRepository.getAllContent(category, difficulty, limit + 1, offset);
      
      // 다음 페이지 존재 여부 판단 및 실제 콘텐츠 예리
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

  /**
   * 사용자 진행 상황 업데이트
   * @param userId - 사용자 ID
   * @param contentId - 콘텐츠 ID
   * @param progressData - 업데이트할 진행 상황 데이터
   * @returns 업데이트된 진행 상황 객체
   */
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

  /**
   * 사용자 교육 요약 정보 조회
   * @param userId - 사용자 ID
   * @returns 사용자 교육 요약 정보
   */
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

  /**
   * 사용자 재정 건강도 점수 계산 및 조회
   * @param userId - 사용자 ID
   * @returns 재정 건강도 점수
   */
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

  /**
   * 사용자에게 재정 건강도 점수 이력 조회
   * @param userId - 사용자 ID
   * @returns 재정 건강도 점수 이력
   */
  async getHealthScoreHistory(userId: number): Promise<FinancialHealthScore[]> {
    try {
      // 최근 6개월간의 점수 이력 조회
      return await this.educationRepository.getHealthScoreHistory(userId, 6);
    } catch (error) {
      logger.error('Failed to get health score history:', error);
      throw new Error('재정 건강도 점수 이력을 가져오는데 실패했습니다.');
    }
  }

  /**
   * 사용자에게 절약 팁 조회
   * @param category - 카테고리 (선택 사항)
   * @param difficulty - 난이도 (선택 사항)
   * @returns 절약 팁 목록
   */
  async getSavingTips(category?: string, difficulty?: string): Promise<SavingTip[]> {
    try {
      return await this.educationRepository.getSavingTips(category, difficulty);
    } catch (error) {
      logger.error('Failed to get saving tips:', error);
      throw new Error('절약 팁을 가져오는데 실패했습니다.');
    }
  }

  /**
   * 사용자에게 개인화된 절약 팁 조회
   * @param userId - 사용자 ID
   * @returns 개인화된 절약 팁 목록
   */
  async getPersonalizedSavingTips(userId: number): Promise<SavingTip[]> {
    try {
      return await this.educationRepository.getPersonalizedTips(userId);
    } catch (error) {
      logger.error('Failed to get personalized saving tips:', error);
      throw new Error('맞춤형 절약 팁을 가져오는데 실패했습니다.');
    }
  }

  /**
   * 사용자에게 절약 팁이 유용했는지 평가
   * @param userId - 사용자 ID
   * @param tipId - 팁 ID
   * @param isHelpful - 유용성 여부
   * @param feedback - 추가 피드백 (선택 사항)
   */
  async markTipAsHelpful(userId: number, tipId: number, isHelpful: boolean, feedback?: string): Promise<void> {
    try {
      await this.educationRepository.markTipAsHelpful(userId, tipId, isHelpful, feedback);

      logger.info(`User ${userId} marked tip ${tipId} as ${isHelpful ? 'helpful' : 'not helpful'}`);
    } catch (error) {
      logger.error('Failed to mark tip as helpful:', error);
      throw new Error('팁 평가 저장에 실패했습니다.');
    }
  }

  /**
   * 사용자에게 개인화된 조언 조회
   * @param userId - 사용자 ID
   * @returns 개인화된 조언 목록
   */
  async getPersonalizedAdvice(userId: number): Promise<PersonalizedAdvice[]> {
    try {
      return await this.educationRepository.getPersonalizedAdvice(userId);
    } catch (error) {
      logger.error('Failed to get personalized advice:', error);
      throw new Error('개인화된 조언을 가져오는데 실패했습니다.');
    }
  }

  /**
   * 사용자에게 개인화된 조언 생성
   * @param userId - 사용자 ID
   * @returns 생성된 개인화된 조언 목록
   */
  async generateAdviceForUser(userId: number): Promise<PersonalizedAdvice[]> {
    try {
      return await this.educationRepository.generatePersonalizedAdvice(userId);
    } catch (error) {
      logger.error('Failed to generate advice:', error);
      throw new Error('개인화된 조언 생성에 실패했습니다.');
    }
  }

  /**
   * 조언 읽음 처리
   * @param userId - 사용자 ID
   * @param adviceId - 조언 ID
   */
  async markAdviceAsRead(userId: number, adviceId: number): Promise<void> {
    try {
      await this.educationRepository.markAdviceAsRead(userId, adviceId);

      logger.info(`User ${userId} marked advice ${adviceId} as read`);
    } catch (error) {
      logger.error('Failed to mark advice as read:', error);
      throw new Error('조언 읽음 처리에 실패했습니다.');
    }
  }

  /**
   * 조언 해제
   * @param userId - 사용자 ID
   * @param adviceId - 조언 ID
   */
  async dismissAdvice(userId: number, adviceId: number): Promise<void> {
    try {
      await this.educationRepository.dismissAdvice(userId, adviceId);

      logger.info(`User ${userId} dismissed advice ${adviceId}`);
    } catch (error) {
      logger.error('Failed to dismiss advice:', error);
      throw new Error('조언 해제에 실패했습니다.');
    }
  }

  /**
   * 교육 대시보드 데이터 조회
   * @param userId - 사용자 ID
   * @returns 교육 대시보드 데이터
   */
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
