/**
 * 알림 관리 API 라우트
 * 
 * 사용자별 알림 조회, 읽음 처리 등 알림 관련 RESTful API 제공.
 * 
 * 주요 기능:
 *  - 사용자 알림 목록 조회 (읽음/안읽음 필터링 가능) 
 *  - 특정 알림 읽음 처리
 *  - 알림 생성/삭제는 서비스 레이어에서 처리 (예: 거래 추가 시 알림 생성)
 * 
 * @author Ju Eul Park (rope-park)
 */
import express from 'express';
import { authenticateToken } from '../../shared/middleware/auth';
import { apiLimiter } from '../../shared/middleware/rateLimiter';
import { asyncHandler } from '../../shared/middleware/errorHandler';
import { NotificationService } from './notification.service';

const router = express.Router();

/**
 * GET /api/notifications
 * 사용자 알림 목록 조회
 * 
 * 사용자 ID를 기반으로 해당 사용자의 알림 목록 조회.
 * 읽지 않은 알림만 필터링 가능.
 * 
 * @route GET /api/notifications
 * @access Private (인증 필요)
 * @query {boolean} unread - 읽지 않은 알림만 조회할지 여부 (선택)
 * @return {Object} 알림 목록
 */
router.get('/',
  apiLimiter,
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const onlyUnread = req.query.unread === 'true'; // 읽지 않은 알림만 조회
    const notifications = await NotificationService.getUserNotifications(userId, onlyUnread);
    res.json({ success: true, data: notifications });
  })
);

/**
 * PATCH /api/notifications/:id/read
 * 특정 알림을 읽음 처리
 * 
 * 알림 ID와 사용자 ID를 기반으로 해당 알림을 읽음 처리.
 * 
 * @route PATCH /api/notifications/:id/read
 * @access Private (인증 필요)
 * @param {number} id - 읽음 처리할 알림 ID
 * @return {Object} 처리 결과
 */
router.patch('/:id/read',
  apiLimiter,
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const id = Number(req.params.id);
    const ok = await NotificationService.markAsRead(id, userId);
    res.json({ success: ok });
  })
);

export default router;