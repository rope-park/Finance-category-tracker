/**
 * 목표 설정 유효성 검사 미들웨어
 * 
 * 사용자의 재정 목표 설정과 관련된 API 요청 데이터의 유효성을 검증.
 * Express Validator를 사용하여 목표 생성/수정 시 입력 데이터를 검증하고
 * 잘못된 데이터가 비즈니스 로직에 전달되는 것을 방지.
 * 
 * 주요 기능:
 * - 목표 생성/수정 시 필수 필드 검증
 * - 데이터 타입 및 형식 유효성 확인
 * - 비즈니스 규칙에 맞는 값 범위 검증
 * - 사용자 친화적 오류 메시지 제공
 * 
 * @author Ju Eul Park (rope-park)
 */
import { body, param } from 'express-validator';
import { handleValidationErrors } from './validation';

/**
 * 목표 설정 데이터 유효성 검사 규칙
 * 
 * 목표 생성 및 수정 API에서 사용되는 요청 데이터의 유효성 검증.
 * 카테고리, 목표 금액, 기간, 시작일 등 필수 정보와 선택 정보를 모두 검증.
 */
export const validateGoal = [
  body('category_key')
    .isString().withMessage('카테고리 키는 필수입니다.')
    .isLength({ min: 1, max: 50 }).withMessage('카테고리 키는 1~50자여야 합니다.'),
  body('target_amount')
    .isNumeric().withMessage('목표 금액은 숫자여야 합니다.')
    .isFloat({ min: 1 }).withMessage('목표 금액은 1 이상이어야 합니다.'),
  body('period')
    .isIn(['monthly', 'yearly']).withMessage('기간은 monthly 또는 yearly만 가능합니다.'),
  body('start_date')
    .isISO8601().withMessage('시작일은 YYYY-MM-DD 형식이어야 합니다.'),
  body('description')
    .optional().isString().isLength({ max: 255 }).withMessage('설명은 255자 이하여야 합니다.'),
  handleValidationErrors
];

/**
 * 목표 ID 파라미터 유효성 검사 규칙
 * 
 * URL 경로에서 전달되는 목표 ID의 유효성 검증.
 * 목표 조회, 수정, 삭제 API에서 사용되며 올바른 정수 형태의 ID인지 확인.
 * 
 */
export const validateGoalId = [
  param('id').isInt({ min: 1 }).withMessage('유효한 목표 ID가 필요합니다.'),
  handleValidationErrors
];