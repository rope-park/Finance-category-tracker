import { Request, Response } from 'express';
import { CommunityService } from './community.service';

export class CommunityController {
  // 게시글 생성
  static async createPost(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const { title, content, category, tags, isAnonymous } = req.body;
      
      // 기본 유효성 검사
      if (!title || title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: '제목을 입력해주세요'
        });
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: '내용을 입력해주세요'
        });
      }

      if (!category || category.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: '카테고리를 선택해주세요'
        });
      }

      const postData = {
        title,
        content,
        category,
        tags: tags || [],
        isAnonymous: isAnonymous || false
      };

      const post = await CommunityService.createPost(userId, postData);
      
      res.status(201).json({
        success: true,
        data: post,
        message: '게시글이 성공적으로 작성되었습니다'
      });
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '게시글 작성에 실패했습니다'
      });
    }
  }

  // 게시글 목록 조회
  static async getPosts(req: Request, res: Response) {
    try {
      const filters = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        category: req.query.category as string,
        search: req.query.search as string,
        sortBy: 'latest' as const
      };

      const result = await CommunityService.getPosts(filters);
      
      res.json({
        success: true,
        data: result.posts,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: result.total,
          pages: Math.ceil(result.total / filters.limit)
        }
      });
    } catch (error) {
      console.error('Get posts error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '게시글 목록 조회에 실패했습니다'
      });
    }
  }

  // 게시글 상세 조회
  static async getPostById(req: Request, res: Response) {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({
          success: false,
          error: '유효한 게시글 ID를 입력해주세요'
        });
      }

      const post = await CommunityService.getPostById(postId);
      
      res.json({
        success: true,
        data: post
      });
    } catch (error) {
      console.error('Get post by id error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '게시글 조회에 실패했습니다'
      });
    }
  }

  // 댓글 생성
  static async createComment(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({
          success: false,
          error: '유효한 게시글 ID를 입력해주세요'
        });
      }

      const { content, parentId, isAnonymous } = req.body;
      
      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: '댓글 내용을 입력해주세요'
        });
      }

      const commentData = {
        postId,
        authorId: userId,
        content,
        parentId: parentId ? parseInt(parentId) : null,
        isAnonymous: isAnonymous || false
      };

      const comment = await CommunityService.createComment(commentData);
      
      res.status(201).json({
        success: true,
        data: comment,
        message: '댓글이 작성되었습니다'
      });
    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '댓글 작성에 실패했습니다'
      });
    }
  }

  // 게시글 좋아요/취소
  static async togglePostLike(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({
          success: false,
          error: '유효한 게시글 ID를 입력해주세요'
        });
      }

      const result = await CommunityService.togglePostLike(postId, userId);
      
      res.json({
        success: true,
        data: result,
        message: result.liked ? '좋아요를 눌렀습니다' : '좋아요를 취소했습니다'
      });
    } catch (error) {
      console.error('Toggle post like error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '좋아요 처리에 실패했습니다'
      });
    }
  }

  // 인기 태그 조회
  static async getPopularTags(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const tags = await CommunityService.getPopularTags(limit);
      
      res.json({
        success: true,
        data: tags
      });
    } catch (error) {
      console.error('Get popular tags error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '인기 태그 조회에 실패했습니다'
      });
    }
  }
}
