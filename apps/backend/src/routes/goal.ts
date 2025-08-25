
import express from 'express';
import { GoalRepository } from '../repositories/goalRepository';

class GoalService {
  private repo: GoalRepository;
  constructor() {
    this.repo = new GoalRepository();
  }
  async createGoal(userId: number, data: any) {
    return this.repo.create(userId, data);
  }
  async getGoals(userId: number) {
    return this.repo.findAll(userId);
  }
  async getGoalById(userId: number, id: string) {
    return this.repo.findById(userId, id);
  }
  async updateGoal(userId: number, id: string, data: any) {
    return this.repo.update(userId, id, data);
  }
  async deleteGoal(userId: number, id: string) {
    return this.repo.delete(userId, id);
  }
}
const goalService = new GoalService();
import { authenticateToken } from '../middleware/auth';
import { validateGoal, validateGoalId } from '../middleware/goalValidation';

const router = express.Router();

// 목표 생성
router.post('/goals', authenticateToken, validateGoal, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const goal = await goalService.createGoal(userId, req.body);
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, error: '목표 생성 중 오류 발생' });
  }
});

// 목표 전체 조회
router.get('/goals', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const goals = await goalService.getGoals(userId);
    res.json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, error: '목표 조회 중 오류 발생' });
  }
});

// 목표 단건 조회
router.get('/goals/:id', authenticateToken, validateGoalId, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const goal = await goalService.getGoalById(userId, id);
    if (!goal) {
      return res.status(404).json({ success: false, error: '목표를 찾을 수 없습니다.' });
    }
    res.json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, error: '목표 조회 중 오류 발생' });
  }
});

// 목표 수정
router.put('/goals/:id', authenticateToken, validateGoalId, validateGoal, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const goal = await goalService.updateGoal(userId, id, req.body);
    if (!goal) {
      return res.status(404).json({ success: false, error: '목표를 찾을 수 없습니다.' });
    }
    res.json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, error: '목표 수정 중 오류 발생' });
  }
});

// 목표 삭제
router.delete('/goals/:id', authenticateToken, validateGoalId, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const goal = await goalService.deleteGoal(userId, id);
    if (!goal) {
      return res.status(404).json({ success: false, error: '목표를 찾을 수 없습니다.' });
    }
    res.json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, error: '목표 삭제 중 오류 발생' });
  }
});

export default router;