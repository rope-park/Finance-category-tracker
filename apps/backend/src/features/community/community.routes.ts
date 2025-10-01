import { Router } from 'express';
import { CommunityController } from './community.controller';
import { authenticateToken } from '../../shared/middleware/auth';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 게시글 관리
router.post('/posts', CommunityController.createPost);
router.get('/posts', CommunityController.getPosts);
router.get('/posts/:postId', CommunityController.getPostById);

// 댓글 관리
router.post('/posts/:postId/comments', CommunityController.createComment);

// 좋아요 관리
router.post('/posts/:postId/like', CommunityController.togglePostLike);

// 인기 태그
router.get('/tags/popular', CommunityController.getPopularTags);

export default router;
