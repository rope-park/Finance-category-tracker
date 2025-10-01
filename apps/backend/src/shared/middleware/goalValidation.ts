import { body, param } from 'express-validator';
import { handleValidationErrors } from './validation';

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

export const validateGoalId = [
  param('id').isInt({ min: 1 }).withMessage('유효한 목표 ID가 필요합니다.'),
  handleValidationErrors
];