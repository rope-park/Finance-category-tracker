import { Request, Response } from 'express';
import { healthCheck } from '../../shared/utils/monitoring';

export const getHealthStatus = (req: Request, res: Response) => {
  // monitoring.ts의 healthCheck는 이미 response를 처리하므로 직접 호출
  return healthCheck(req, res);
};