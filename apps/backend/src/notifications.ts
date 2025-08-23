// notifications.ts
import express from 'express';
import { authenticateToken } from '../features/auth/middleware/authMiddleware';
import { apiLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../middleware/errorHandler';
import { NotificationService } from '../services/notificationService';

const router = express.Router();

// 내 알림 목록 조회
router.get('/',
  apiLimiter,
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const onlyUnread = req.query.unread === 'true';
    const notifications = await NotificationService.getUserNotifications(userId, onlyUnread);
    res.json({ success: true, data: notifications });
  })
);

// 알림 읽음 처리
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
