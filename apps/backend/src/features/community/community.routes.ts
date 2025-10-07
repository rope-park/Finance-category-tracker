/**
 * 커뮤니티 API 라우트
 * 
 * 사용자 간 소통과 정보 공유를 위한 커뮤니티 기능.
 * 전체 라우트에서 인증 필수이며, 컨텐츠 검상과 스팩 방지 기능 포함.
 * 
 * 주요 기능:
 * - 게시글 CRUD 및 검색
 * - 댓글 시스템
 * - 좋아요/싫어요 처리
 * - 태그 기반 분류
 * 
 * @author Ju Eul Park (rope-park)
 */

import { Router } from 'express';
import { CommunityController } from './community.controller';
import { authenticateToken } from '../../shared/middleware/auth';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용 (보안 강화)
router.use(authenticateToken);

// ==================================================
// 게시글 관련 엔드포인트
// ==================================================

/**
 * POST api/community/posts
 * 게시글 생성
 * 
 * 새로운 게시글을 작성하여 커뮤니티에 공유.
 * 
 * @route POST api/community/posts
 * @access Private (인증 필요)
 * @rateLimit 사용자별 요청 빈도 제한 적용
 */
router.post('/posts', CommunityController.createPost);

/**
 * GET api/community/posts
 * 게시글 목록 조회 (페이지네이션 지원)
 * 
 * 최신 게시글을 페이지네이션과 함께 조회.
 * 
 * @route GET api/community/posts
 * @access Private (인증 필요)
 * @rateLimit 사용자별 요청 빈도 제한 적용
 */
router.get('/posts', CommunityController.getPosts);

/**
 * GET api/community/posts/:postId
 * 특정 게시글 상세 조회
 * 
 * 게시글 ID로 특정 게시글 상세 내용 조회.
 * 
 * @route GET api/community/posts/:postId
 * @access Private (인증 필요)
 * @rateLimit 사용자별 요청 빈도 제한 적용
 */
router.get('/posts/:postId', CommunityController.getPostById);

// ==================================================
// 댓글 및 상호작용 엔드포인트
// ==================================================

/**
 * POST api/community/posts/:postId/comments
 * 댓글 작성
 * 
 * 특정 게시글에 댓글을 작성하여 의견 공유.
 * 
 * @route POST api/community/posts/:postId/comments
 * @access Private (인증 필요)
 * @rateLimit 사용자별 요청 빈도 제한 적용
 */
router.post('/posts/:postId/comments', CommunityController.createComment);

/**
 * POST api/community/posts/:postId/like
 * 게시글 좋아요/취소 토글
 * 
 * 사용자가 게시글에 좋아요를 누르거나 취소할 수 있도록 함.
 * 
 * @route POST api/community/posts/:postId/like
 * @access Private (인증 필요)
 * @rateLimit 사용자별 요청 빈도 제한 적용
 */
router.post('/posts/:postId/like', CommunityController.togglePostLike);

// ==================================================
// 태그 및 분류 엔드포인트
// ==================================================

/**
 * GET api/community/tags/popular
 * 인기 태그 목록 조회
 * 
 * 커뮤니티 내에서 자주 사용되는 인기 태그 목록 조회.
 * 
 * @route GET api/community/tags/popular
 * @access Private (인증 필요)
 * @rateLimit 사용자별 요청 빈도 제한 적용
 */
router.get('/tags/popular', CommunityController.getPopularTags);

export default router;
