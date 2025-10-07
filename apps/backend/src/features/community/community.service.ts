/**
 * 커뮤니티 서비스
 * 
 * 사용자들 간의 재정 관리 경험과 지식을 공유할 수 있는 커뮤니티 플랫폼 서비스.
 * 재정 관리 팁, 질문과 답변, 성취 공유, 토론 등의 소셜 기능 제공.
 * 
 * 주요 기능:
 * - 카테고리별 커뮤니티 포스트 작성 및 관리
 * - 익명 포스트 등록 및 프라이버시 보호
 * - 좋아요, 댓글, 조회수 등 소셜 인터렉션
 * - 인기 포스트 및 트렌딩 콘텐츠 추천
 * 
 * @author Ju Eul Park (rope-park)
 */

import { CommunityRepository } from './community.repository';

/**
 * 커뮤니티 서비스 비즈니스 로직 클래스
 * 
 * Repository 패턴을 사용하여 데이터 접근과 비즈니스 로직을 분리.
 * 커뮤니티 포스트와 소셜 인터렉션을 담당하는 서비스 레이어.
 */
export class CommunityService {
  private static repo = new CommunityRepository();

  /**
   * 새로운 커뮤니티 포스트 생성
   * @param authorId - 포스트 작성자 ID
   * @param postData - 포스트 생성에 필요한 데이터 (제목, 내용, 카테고리, 태그 등)
   * @returns 생성된 포스트 객체
   */
  static async createPost(authorId: number, postData: {
    title: string;
    content: string;
    category: 'tip' | 'question' | 'achievement' | 'discussion';
    tags?: string[];
    isAnonymous?: boolean;
  }): Promise<any> {
    return await this.repo.createPost({
      ...postData,
      authorId,
      status: 'published', // 바로 게시 상태로 설정
      likesCount: 0,      // 초기 좋아요 수
      commentsCount: 0,   // 초기 댓글 수
      viewsCount: 0       // 초기 조회수
    });
  }

  /**
   * 커뮤니티 포스트 목록 조회 (필터링 가능)
   * @param filters - 검색 필터 옵션 (카테고리, 태그, 정렬 기준 등)
   * @returns 필터링된 포스트 목록
   */
  static async getPosts(filters?: {
    category?: string;
    tags?: string[];
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: 'latest' | 'popular' | 'trending';
  }): Promise<{ posts: any[]; total: number }> {
    return await this.repo.findPosts(filters || {});
  }

  /**
   * 커뮤니티 포스트 상세 조회
   * @param postId - 조회할 포스트 ID
   * @param viewerId - 포스트를 조회하는 사용자 ID (옵션)
   * @returns 포스트 객체
   */
  static async getPostById(postId: number, viewerId?: number): Promise<any> {
    const post = await this.repo.findPostById(postId);
    
    if (!post) {
      throw new Error('포스트를 찾을 수 없습니다');
    }

    // 조회수 증가 (작성자가 아닌 경우)
    if (viewerId && viewerId !== post.authorId) {
      await this.repo.incrementViews(postId);
    }

    return post;
  }

  /**
   * 댓글 작성
   * @param commentData - 댓글 생성에 필요한 데이터
   * @returns 생성된 댓글 객체
   */
  static async createComment(commentData: {
    postId: number;     // 댓글이 달릴 포스트 ID
    authorId: number;   // 댓글 작성자 ID
    content: string;    // 댓글 내용
    parentCommentId?: number; // 대댓글인 경우 부모 댓글 ID
    isAnonymous?: boolean;  // 익명 여부
  }): Promise<any> {
    const post = await this.repo.findPostById(commentData.postId);
    
    if (!post) {
      throw new Error('포스트를 찾을 수 없습니다');
    }

    const comment = await this.repo.createComment({
      ...commentData,
      likesCount: 0
    });

    // 포스트의 댓글 수 증가
    await this.repo.incrementCommentCount(commentData.postId);

    return comment;
  }

  /**
   * 포스트 좋아요/취소
   * @param postId - 좋아요/취소할 포스트 ID
   * @param userId - 좋아요/취소할 사용자 ID
   * @returns 좋아요 상태 및 현재 좋아요 수
   */
  static async togglePostLike(postId: number, userId: number): Promise<{ liked: boolean; likesCount: number }> {
    const post = await this.repo.findPostById(postId);
    
    if (!post) {
      throw new Error('포스트를 찾을 수 없습니다');
    }

    const existingLike = await this.repo.findLike(postId, userId);

    if (existingLike) {
      // 좋아요 취소
      await this.repo.removeLike(postId, userId);
      const updatedPost = await this.repo.decrementLikeCount(postId);
      return { liked: false, likesCount: updatedPost.likesCount };
    } else {
      // 좋아요 추가
      await this.repo.createLike(postId, userId);
      const updatedPost = await this.repo.incrementLikeCount(postId);
      return { liked: true, likesCount: updatedPost.likesCount };
    }
  }

  /**
   * 사용자가 좋아요한 포스트 목록 조회
   * @param userId - 좋아요한 포스트를 조회할 사용자 ID
   * @param page - 페이지 번호
   * @param limit - 페이지당 포스트 수
   * @returns 좋아요한 포스트 목록
   */
  static async getUserLikedPosts(userId: number, page = 1, limit = 10): Promise<{ posts: any[]; total: number }> {
    return await this.repo.findUserLikedPosts(userId, page, limit);
  }

  /**
   * 사용자가 작성한 포스트 목록 조회
   * @param userId - 포스트를 조회할 사용자 ID
   * @param page - 페이지 번호
   * @param limit - 페이지당 포스트 수
   * @returns 사용자가 작성한 포스트 목록
   */
  static async getUserPosts(userId: number, page = 1, limit = 10): Promise<{ posts: any[]; total: number }> {
    return await this.repo.findUserPosts(userId, page, limit);
  }

  /**
   * 게시글 수정
   * @param postId - 수정할 포스트 ID
   * @param userId - 포스트 작성자 ID (보안 검사용)
   * @param updateData - 수정할 데이터
   * @returns 수정된 포스트 객체
   */
  static async updatePost(postId: number, userId: number, updateData: {
    title?: string;
    content?: string;
    category?: string;
    tags?: string[];
  }): Promise<any> {
    return await CommunityRepository.updatePost(postId, userId, updateData);
  }

  /**
   * 게시글 삭제
   * @param postId - 삭제할 포스트 ID
   * @param userId - 포스트 작성자 ID (보안 검사용)
   */
  static async deletePost(postId: number, userId: number): Promise<void> {
    return await CommunityRepository.deletePost(postId, userId);
  }

  /**
   * 댓글 목록 조회
   * @param postId - 댓글이 달린 포스트 ID
   * @param filters - 필터링 옵션
   * @returns 댓글 목록
   */
  static async getPostComments(postId: number, filters: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  } = {}): Promise<{ comments: any[]; total: number }> {
    return await CommunityRepository.getPostComments(postId, filters);
  }

  /**
   * 댓글 수정
   * @param commentId - 수정할 댓글 ID
   * @param userId - 댓글 작성자 ID (보안 검사용)
   * @param updateData - 수정할 데이터
   * @returns 수정된 댓글 객체
   */
  static async updateComment(commentId: number, userId: number, updateData: {
    content: string;
  }): Promise<any> {
    return await CommunityRepository.updateComment(commentId, userId, updateData);
  }

  /**
   * 댓글 삭제
   * @param commentId - 삭제할 댓글 ID
   * @param userId - 댓글 작성자 ID (보안 검사용)
   * @returns 삭제 성공 여부
   */
  static async deleteComment(commentId: number, userId: number): Promise<void> {
    return await CommunityRepository.deleteComment(commentId, userId);
  }

  /**
   * 댓글 좋아요/취소
   * @param commentId - 좋아요/취소할 댓글 ID
   * @param userId - 좋아요/취소할 사용자 ID
   * @returns 좋아요 상태 및 현재 좋아요 수
   */
  static async toggleCommentLike(commentId: number, userId: number): Promise<{ liked: boolean; likeCount: number }> {
    return await CommunityRepository.toggleCommentLike(commentId, userId);
  }

  /**
   * 인기 게시글 조회
   * @param filters - 필터 옵션 (기간, 카테고리 등)
   * @returns 인기 게시글 목록
   */
  static async getPopularPosts(filters: {
    period?: 'day' | 'week' | 'month';
    limit?: number;
    category?: string;
  } = {}): Promise<any[]> {
    return await CommunityRepository.getPopularPosts(filters);
  }

  /**
   * 게시글 통계 조회
   * @param postId - 조회할 포스트 ID
   * @returns 게시글 통계 정보
   */
  static async getPostStats(postId: number): Promise<{
    viewCount: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
  }> {
    return await CommunityRepository.getPostStats(postId);
  }

  /**
   * 사용자 활동 통계 조회
   * @param userId - 사용자 ID
   * @returns 사용자 활동 통계 정보
   */
  static async getUserActivityStats(userId: number): Promise<{
    postCount: number;
    commentCount: number;
    likeCount: number;
    totalViews: number;
  }> {
    return await CommunityRepository.getUserActivityStats(userId);
  }

  /**
   * 인기 태그 조회
   * @param limit - 조회할 태그 수
   * @returns 인기 태그 목록
   */
  static async getPopularTags(limit = 10): Promise<Array<{ tag: string; count: number }>> {
    return await this.repo.getPopularTags(limit);
  }

  /**
   * 커뮤니티 전체 통계 정보 조회
   * @returns 커뮤니티 전체 통계 정보
   */
  static async getCommunityStats(): Promise<{
    totalPosts: number;
    totalUsers: number;
    postsThisWeek: number;
    popularCategories: Array<{ category: string; count: number }>;
  }> {
    return await this.repo.getCommunityStats();
  }

  /**
   * 추천 포스트 목록 조회
   * @param userId - 추천 포스트를 받을 사용자 ID
   * @param limit - 조회할 포스트 수
   * @returns 추천 포스트 목록
   */
  static async getRecommendedPosts(userId: number, limit = 5): Promise<any[]> {
    return await this.repo.getRecommendedPosts(userId, limit);
  }
}
