import { CommunityRepository } from './community.repository';

export class CommunityService {
  private static repo = new CommunityRepository();

  // 포스트 생성
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
      status: 'published',
      likesCount: 0,
      commentsCount: 0,
      viewsCount: 0
    });
  }

  // 포스트 목록 조회
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

  // 포스트 상세 조회
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

  // 댓글 작성
  static async createComment(commentData: {
    postId: number;
    authorId: number;
    content: string;
    parentCommentId?: number;
    isAnonymous?: boolean;
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

  // 포스트 좋아요/취소
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

  // 사용자가 좋아요한 포스트 목록
  static async getUserLikedPosts(userId: number, page = 1, limit = 10): Promise<{ posts: any[]; total: number }> {
    return await this.repo.findUserLikedPosts(userId, page, limit);
  }

  // 사용자 포스트 목록
  static async getUserPosts(userId: number, page = 1, limit = 10): Promise<{ posts: any[]; total: number }> {
    return await this.repo.findUserPosts(userId, page, limit);
  }

  // 게시글 수정
  static async updatePost(postId: number, userId: number, updateData: {
    title?: string;
    content?: string;
    category?: string;
    tags?: string[];
  }): Promise<any> {
    return await CommunityRepository.updatePost(postId, userId, updateData);
  }

  // 게시글 삭제
  static async deletePost(postId: number, userId: number): Promise<void> {
    return await CommunityRepository.deletePost(postId, userId);
  }

  // 게시글 댓글 목록 조회
  static async getPostComments(postId: number, filters: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  } = {}): Promise<{ comments: any[]; total: number }> {
    return await CommunityRepository.getPostComments(postId, filters);
  }

  // 댓글 수정
  static async updateComment(commentId: number, userId: number, updateData: {
    content: string;
  }): Promise<any> {
    return await CommunityRepository.updateComment(commentId, userId, updateData);
  }

  // 댓글 삭제
  static async deleteComment(commentId: number, userId: number): Promise<void> {
    return await CommunityRepository.deleteComment(commentId, userId);
  }

  // 댓글 좋아요/취소
  static async toggleCommentLike(commentId: number, userId: number): Promise<{ liked: boolean; likeCount: number }> {
    return await CommunityRepository.toggleCommentLike(commentId, userId);
  }

  // 인기 게시글 조회
  static async getPopularPosts(filters: {
    period?: 'day' | 'week' | 'month';
    limit?: number;
    category?: string;
  } = {}): Promise<any[]> {
    return await CommunityRepository.getPopularPosts(filters);
  }

  // 게시글 통계
  static async getPostStats(postId: number): Promise<{
    viewCount: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
  }> {
    return await CommunityRepository.getPostStats(postId);
  }

  // 사용자 활동 통계
  static async getUserActivityStats(userId: number): Promise<{
    postCount: number;
    commentCount: number;
    likeCount: number;
    totalViews: number;
  }> {
    return await CommunityRepository.getUserActivityStats(userId);
  }

  // 인기 태그 조회
  static async getPopularTags(limit = 10): Promise<Array<{ tag: string; count: number }>> {
    return await this.repo.getPopularTags(limit);
  }

  // 커뮤니티 통계
  static async getCommunityStats(): Promise<{
    totalPosts: number;
    totalUsers: number;
    postsThisWeek: number;
    popularCategories: Array<{ category: string; count: number }>;
  }> {
    return await this.repo.getCommunityStats();
  }

  // 추천 포스트
  static async getRecommendedPosts(userId: number, limit = 5): Promise<any[]> {
    return await this.repo.getRecommendedPosts(userId, limit);
  }
}
