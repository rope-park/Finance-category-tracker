/**
 * 요청 유효성 검사 미들웨어
 * 
 * Express Validator를 사용하여 API 요청 데이터의 유효성을 검사하는 공통 미들웨어.
 * 다양한 API 엔드포인트에서 재사용 가능하며, 일관된 오류 응답 형식을 제공.
 * 
 * 주요 기능:
 * - Express Validator의 검증 결과를 취합하여 오류 처리
 * - 사용자 친화적인 오류 메시지 생성
 * - 일관된 오류 응답 형식 제공
 * - 검증 통과 시 다음 미들웨어로 제어권 전달
 * 
 * @author Ju Eul Park (rope-park)
 */
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { createErrorResponse } from '../utils/response';

/**
 * 요청 데이터 유효성 검사를 수행하는 미들웨어 함수
 * 
 * Express Validator에 의해 수집된 유효성 검사 결과를 확인하고,
 * 오류가 있을 경우 400 상태 코드와 함께 오류 메시지를 응답으로 반환.
 * 모든 검증이 통과하면 다음 미들웨어로 제어권을 넘김.

 * @param req - Express 요청 객체 (유효성 검사 결과 포함)
 * @param res - Express 응답 객체
 * @param next - 다음 미들웨어 호출 함수
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg).join(', ');
    return res.status(400).json(createErrorResponse('입력 데이터가 유효하지 않습니다.', errorMessages));
  }
  
  next();
};
