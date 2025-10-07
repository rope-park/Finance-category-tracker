/**
 * 반복 거래 템플릿 API 라우트
 * 
 * 정기적 거래(월급, 용돈, 공과금, 구독료 등)를 템플릿으로 저장 및 관리하는 API 엔드포인트 제공함.
 * 
 * 주요 기능:
 * - 반복 거래 템플릿 생성 및 관리
 * - 주기별 자동 거래 생성 (일간, 주간, 월간, 연간)
 * - 템플릿 기반 빠른 거래 입력
 * - 반복 패턴 커스터마이징 (예: 매월 1일, 매주 금요일 등)
 * 
 * @author Ju Eul Park (rope-park)
 */

const express = require('express');
import { authenticateToken } from '../../shared/middleware/auth';
import { RecurringTemplateService } from './recurring-template.service';

/**
 * Express Request 인터페이스 확장
 * JWT 인증을 통해 추가된 사용자 정보 타입 정의
 */
declare global {
  namespace Express {
    interface User {
      id: number;     // 사용자 고유 ID
      email: string;  // 사용자 이메일 주소
      name: string;   // 사용자 이름
    }
    /** Request 객체에 사용자 정보 추가 */
    interface Request {
      user?: User;  // 인증된 사용자 정보 (선택적)
    }
  }
}

const router = express.Router();

/**
 * POST /api/transactions/recurring-templates
 * 반복 거래 템플릿 생성
 * 
 * 새로운 반복 거래 패턴을 템플릿으로 저장.
 * 주기, 금액, 카테고리 등 상세 설정 가능.
 * 
 * @route POST /api/transactions/recurring-templates
 * @access Private (인증 필요)
 * @returns 생성된 템플릿 정보와 다음 실행 예정일
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const data = { ...req.body, user_id: userId };
    
    const template = await RecurringTemplateService.createTemplate(data);
    
    res.status(201).json({ 
      success: true, 
      data: template,
      message: '반복 거래 템플릿이 성공적으로 생성되었습니다.'
    });
  } catch (error) {
    console.error('반복 템플릿 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: '템플릿 생성 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/transactions/recurring-templates
 * 사용자의 반복 거래 템플릿 목록 조회
 * 
 * 현재 사용자가 생성한 모든 반복 거래 템플릿 조회.
 *
 * @route GET /api/transactions/recurring-templates
 * @access Private (인증 필요)
 * @returns 템플릿 목록과 각 템플릿의 상태 정보
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const templates = await RecurringTemplateService.getTemplates(userId);
    
    res.json({ 
      success: true, 
      data: templates,
      count: templates.length,
      message: '반복 거래 템플릿을 성공적으로 조회했습니다.'
    });
  } catch (error) {
    console.error('반복 템플릿 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '템플릿 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * PUT /api/transactions/recurring-templates/:id
 * 반복 거래 템플릿 수정
 * 
 * 기존 템플릿의 설정 업데이트.
 * 반복 주기, 금액, 활성화 상태 등 변경 가능.
 * 
 * @route PUT /api/transactions/recurring-templates/:id
 * @access Private (인증 필요, 템플릿 소유자만)
 * @returns 수정된 템플릿 정보
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const id = Number(req.params.id);
    
    const updated = await RecurringTemplateService.updateTemplate(id, userId, req.body);
    
    res.json({ 
      success: true, 
      data: updated,
      message: '반복 거래 템플릿이 성공적으로 수정되었습니다.'
    });
  } catch (error) {
    console.error('반복 템플릿 수정 오류:', error);
    res.status(500).json({
      success: false,
      error: '템플릿 수정 중 오류가 발생했습니다.'
    });
  }
});

/**
 * DELETE /api/transactions/recurring-templates/:id
 * 반복 거래 템플릿 삭제
 * 
 * 특정 반복 거래 템플릿 완전히 삭제.
 * 삭제 후에는 해당 패턴의 자동 거래 생성 중단됨.
 * 
 * @route DELETE /api/transactions/recurring-templates/:id
 * @access Private (인증 필요, 템플릿 소유자만)
 * @returns 삭제 완료 상태 (204 No Content)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const id = Number(req.params.id);
    
    await RecurringTemplateService.deleteTemplate(id, userId);
    
    // 204 No Content - 성공적으로 삭제되었으며 반환할 내용 없음
    res.status(204).send();
  } catch (error) {
    console.error('반복 템플릿 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: '템플릿 삭제 중 오류가 발생했습니다.'
    });
  }
});

export default router;