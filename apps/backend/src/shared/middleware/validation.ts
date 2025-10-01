import { Request, Response, NextFunction } from 'express';
import { body, validationResult, param, query } from 'express-validator';
import { ApiResponse } from '../../core/types';

// 에러 핸들링 미들웨어
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.type === 'field' ? (error as any).path : 'unknown',
        message: error.msg
      })),
      timestamp: new Date().toISOString()
    } as ApiResponse);
  }
  next();
};

// 이메일 형식 검증
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 비밀번호 강도 검증 (최소 8자, 대소문자, 숫자, 특수문자 포함)
export const validatePassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// 회원가입 검증 체인
export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required')
    .isLength({ max: 255 })
    .withMessage('Email must be less than 255 characters'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be 8-128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be 1-100 characters')
    .matches(/^[a-zA-Z0-9가-힣\s]+$/)
    .withMessage('Name contains invalid characters'),
  handleValidationErrors
];

// 로그인 검증 체인
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ max: 128 })
    .withMessage('Password too long'),
  body('rememberMe')
    .optional()
    .isBoolean()
    .withMessage('Remember me must be boolean'),
  handleValidationErrors
];

// 거래 내역 검증 체인
export const validateTransaction = [
  body('amount')
    .isFloat({ min: 0.01, max: 999999999.99 })
    .withMessage('Amount must be between 0.01 and 999,999,999.99')
    .toFloat(),
  body('transaction_type')
    .isIn(['income', 'expense'])
    .withMessage('Transaction type must be income or expense'),
  body('category_key')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category is required and must be less than 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Category key contains invalid characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('merchant')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Merchant must be less than 100 characters'),
  body('transaction_date')
    .isISO8601()
    .withMessage('Valid date is required (YYYY-MM-DD format)')
    .toDate(),
  handleValidationErrors
];

// 예산 검증 체인
export const validateBudget = [
  body('amount')
    .isFloat({ min: 0.01, max: 999999999.99 })
    .withMessage('Amount must be between 0.01 and 999,999,999.99')
    .toFloat(),
  body('category_key')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category is required')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Category key contains invalid characters'),
  body('period_start')
    .isISO8601()
    .withMessage('Period start must be a valid date (YYYY-MM-DD format)')
    .toDate(),
  body('period_end')
    .isISO8601()
    .withMessage('Period end must be a valid date (YYYY-MM-DD format)')
    .toDate(),
  handleValidationErrors
];

// ID 파라미터 검증
export const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid ID is required')
    .toInt(),
  handleValidationErrors
];

// 카테고리 키 파라미터 검증
export const validateCategoryKey = [
  param('key')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Valid category key is required')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Category key contains invalid characters'),
  handleValidationErrors
];

// 페이지네이션 검증
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be between 1 and 1000')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  handleValidationErrors
];

// 날짜 범위 검증
export const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be valid ISO 8601 format')
    .toDate(),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be valid ISO 8601 format')
    .toDate(),
  handleValidationErrors
];

// 프로필 업데이트 검증
export const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be 1-100 characters')
    .matches(/^[a-zA-Z0-9가-힣\s]+$/)
    .withMessage('Name contains invalid characters'),
  body('profile_picture')
    .optional()
    .isURL()
    .withMessage('Profile picture must be a valid URL')
    .isLength({ max: 500 })
    .withMessage('Profile picture URL too long'),
  body('phone_number')
    .optional()
    .matches(/^[+]?[\d\s\-()]+$/)
    .withMessage('Invalid phone number format')
    .isLength({ max: 20 })
    .withMessage('Phone number too long'),
  body('age_group')
    .optional()
    .isIn(['18-25', '26-35', '36-45', '46-55', '55+'])
    .withMessage('Invalid age group'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio must be less than 1000 characters'),
  handleValidationErrors
];

// 비밀번호 변경 검증
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required')
    .isLength({ max: 128 })
    .withMessage('Current password too long'),
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('New password must be 8-128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain uppercase, lowercase, number and special character'),
  handleValidationErrors
];

// 회원가입 데이터 검증
export const validateRegisterData = (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name } = req.body;

  // 필수 필드 확인
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      error: '이메일, 비밀번호, 이름은 필수입니다.'
    } as ApiResponse);
  }

  // 이메일 형식 검증
  if (!validateEmail(email)) {
    return res.status(400).json({
      success: false,
      error: '올바른 이메일 형식이 아닙니다.'
    } as ApiResponse);
  }

  // 비밀번호 검증
  if (!validatePassword(password)) {
    return res.status(400).json({
      success: false,
      error: '비밀번호는 최소 8자 이상이며, 영문과 숫자를 포함해야 합니다.'
    } as ApiResponse);
  }

  // 이름 길이 검증
  if (name.trim().length < 2 || name.trim().length > 50) {
    return res.status(400).json({
      success: false,
      error: '이름은 2자 이상 50자 이하여야 합니다.'
    } as ApiResponse);
  }

  next();
};

// 로그인 데이터 검증
export const validateLoginData = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: '이메일과 비밀번호를 입력해주세요.'
    } as ApiResponse);
  }

  if (!validateEmail(email)) {
    return res.status(400).json({
      success: false,
      error: '올바른 이메일 형식이 아닙니다.'
    } as ApiResponse);
  }

  next();
};

// 거래 데이터 검증
export const validateTransactionData = (req: Request, res: Response, next: NextFunction) => {
  const { category_key, transaction_type, amount, transaction_date } = req.body;

  if (!category_key || !transaction_type || !amount || !transaction_date) {
    return res.status(400).json({
      success: false,
      error: '카테고리, 거래 유형, 금액, 거래 날짜는 필수입니다.'
    } as ApiResponse);
  }

  if (!['income', 'expense'].includes(transaction_type)) {
    return res.status(400).json({
      success: false,
      error: '거래 유형은 income 또는 expense여야 합니다.'
    } as ApiResponse);
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: '금액은 0보다 큰 숫자여야 합니다.'
    } as ApiResponse);
  }

  // 날짜 형식 검증 (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(transaction_date)) {
    return res.status(400).json({
      success: false,
      error: '날짜는 YYYY-MM-DD 형식이어야 합니다.'
    } as ApiResponse);
  }

  next();
};

// 예산 데이터 검증
export const validateBudgetData = (req: Request, res: Response, next: NextFunction) => {
  const { category_key, amount, period_start, period_end } = req.body;

  if (!category_key || !amount || !period_start || !period_end) {
    return res.status(400).json({
      success: false,
      error: '카테고리, 금액, 시작일, 종료일은 필수입니다.'
    } as ApiResponse);
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: '금액은 0보다 큰 숫자여야 합니다.'
    } as ApiResponse);
  }

  // 날짜 형식 검증
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(period_start) || !dateRegex.test(period_end)) {
    return res.status(400).json({
      success: false,
      error: '날짜는 YYYY-MM-DD 형식이어야 합니다.'
    } as ApiResponse);
  }

  // 종료일이 시작일보다 늦은지 확인
  if (new Date(period_end) <= new Date(period_start)) {
    return res.status(400).json({
      success: false,
      error: '종료일은 시작일보다 늦어야 합니다.'
    } as ApiResponse);
  }

  next();
};

// 프로필 업데이트 데이터 검증
export const validateProfileData = (req: Request, res: Response, next: NextFunction) => {
  const { name, age_group, phone_number } = req.body;

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 50) {
      return res.status(400).json({
        success: false,
        error: '이름은 2자 이상 50자 이하여야 합니다.'
      } as ApiResponse);
    }
  }

  if (age_group !== undefined) {
    const validAgeGroups = ['10s', '20s', '30s', '40s', '50s', '60s+'];
    if (!validAgeGroups.includes(age_group)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 연령대입니다.'
      } as ApiResponse);
    }
  }

  if (phone_number !== undefined) {
    const phoneRegex = /^(\+82|0)?[0-9]{2,3}-?[0-9]{3,4}-?[0-9]{4}$/;
    if (phone_number && !phoneRegex.test(phone_number)) {
      return res.status(400).json({
        success: false,
        error: '올바른 전화번호 형식이 아닙니다.'
      } as ApiResponse);
    }
  }

  next();
};