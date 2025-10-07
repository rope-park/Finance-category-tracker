/**
 * 시스템 헬스 체크 컨트롤러
 * 
 * 서버의 전반적인 상태와 의존성 서비스들의 동작 상태 모니터링.
 * 로드 밸런서, 모니터링 시스템에서 서버 가용성 확인 용도로 활용.
 * 
 * 주요 기능:
 * - 서버 응답성 및 기본 동작 상태 체크
 * - 데이터베이스 연결 상태 확인
 * - 외부 서비스 연동 상태 점검
 * - 시스템 리소스 사용량 모니터링
 * 
 * @author Ju Eul Park (rope-park)
 */
import { Request, Response } from 'express';
import { healthCheck } from '../../shared/utils/monitoring';

/**
 * 시스템 전체 헬스 상태 조회 컨트롤러 함수
 * 
 * 서버의 전반적인 동작 상태와 의존성 서비스들의 연결 상태를 체크.
 * monitoring.ts의 healthCheck 함수가 이미 response 처리를 담당하므로 직접 호출.
 * 
 * 응답 형태:
 * - status: 'healthy' | 'degraded' | 'unhealthy'
 * - database: 데이터베이스 연결 상태
 * - services: 외부 서비스 연동 상태
 * - uptime: 서버 가동 시간
 * - memory: 메모리 사용량 정보
 * 
 * @param req - Express 요청 객체
 * @param res - Express 응답 객체
 * @returns 헬스 체크 결과 JSON 응답
 */
export const getHealthStatus = (req: Request, res: Response) => {
  return healthCheck(req, res);
};