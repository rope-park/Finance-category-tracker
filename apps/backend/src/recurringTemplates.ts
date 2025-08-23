import express from 'express';
import { authenticateToken } from '../features/auth/middleware/authMiddleware';
import { RecurringTemplateService } from '../services/recurringTemplateService';

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      name: string;
    }
    interface Request {
      user?: User;
    }
  }
}

const router = express.Router();

// 반복 거래 템플릿 생성
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user!.id;
  const data = { ...req.body, user_id: userId };
  const template = await RecurringTemplateService.createTemplate(data);
  res.status(201).json({ success: true, data: template });
});

// 내 반복 거래 템플릿 목록
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user!.id;
  const templates = await RecurringTemplateService.getTemplates(userId);
  res.json({ success: true, data: templates });
});

// 반복 거래 템플릿 수정
router.put('/:id', authenticateToken, async (req, res) => {
  const userId = req.user!.id;
  const id = Number(req.params.id);
  const updated = await RecurringTemplateService.updateTemplate(id, userId, req.body);
  res.json({ success: true, data: updated });
});

// 반복 거래 템플릿 삭제
router.delete('/:id', authenticateToken, async (req, res) => {
  const userId = req.user!.id;
  const id = Number(req.params.id);
  await RecurringTemplateService.deleteTemplate(id, userId);
  res.status(204).send();
});

export default router;
