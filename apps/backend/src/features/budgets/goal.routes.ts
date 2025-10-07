/**
 * 목표 관련 API 라우트
 * 
 * 사용자가 예산 목표를 생성, 조회, 수정, 삭제할 수 있는 API 엔드포인트 제공.
 * 인증 및 입력 검증 미들웨어 포함.
 */
const express = require('express');
import { GoalRepository } from './goal.repository';

/**
 * 목표 서비스 클래스
 * 
 * 목표 생성, 조회, 수정, 삭제 등의 비즈니스 로직 처리.
 */
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
import { authenticateToken } from '../../shared/middleware/auth';
import { validateGoal, validateGoalId } from '../../shared/middleware/goalValidation';

const router = express.Router();

/**
 * POST /api/goals
 * 목표 생성
 * 
 * 사용자가 새로운 예산 목표를 설정할 수 있도록 함.
 * 
 * @route POST /api/goals
 * @access Private (인증 필요)
 * @returns {Object} 생성된 목표 정보
 */
router.post('/goals', authenticateToken, validateGoal, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const goal = await goalService.createGoal(userId, req.body);
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, error: '목표 생성 중 오류 발생' });
  }
});

/**
 * GET /api/goals
 * 목표 목록 조회
 * 
 * 사용자가 설정한 모든 예산 목표 조회.
 * 
 * @route GET /api/goals
 * @access Private (인증 필요)
 * @returns {Object} 목표 목록
 */
router.get('/goals', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const goals = await goalService.getGoals(userId);
    res.json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, error: '목표 조회 중 오류 발생' });
  }
});

/**
 * GET /api/goals/:id
 * 특정 목표 조회
 * 
 * 사용자가 설정한 특정 예산 목표 상세 조회.
 * 
 * @route GET /api/goals/:id
 * @access Private (인증 필요)
 * @returns {Object} 특정 목표 정보
 */
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

/**
 * PUT /api/goals/:id
 * 목표 수정
 * 
 * 사용자가 기존 목표를 업데이트할 수 있도록 함.
 * 
 * @route PUT /api/goals/:id
 * @access Private (인증 필요)
 * @returns {Object} 수정된 목표 정보
 */
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

/**
 * DELETE /api/goals/:id
 * 목표 삭제
 * 
 * 특정 목표를 삭제하여 더 이상 추적하지 않도록 함.
 * 
 * @route DELETE /api/goals/:id
 * @access Private (인증 필요)
 * @returns {204} 성공적으로 삭제되었음을 나타내는 상태 코드
 */
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