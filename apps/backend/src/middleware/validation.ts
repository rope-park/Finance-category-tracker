import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

// 이메일 형식 검증
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 비밀번호 강도 검증 (최소 8자, 영문, 숫자 포함)
export const validatePassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
};

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
