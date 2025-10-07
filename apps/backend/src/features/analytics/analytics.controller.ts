/**
 * 분석 및 통계 컨트롤러
 * 
 * 사용자의 재정 데이터를 분석하여 유용한 인사이트 제공.
 * 복잡한 통계 계산과 데이터 집계 담당.
 * 
 * 주요 기능:
 * - 지출 패턴 분석 (월별, 카테고리별)
 * - 수입/지출 트렌드 분석
 * - 예산 대비 실제 지출 비교
 * - 카테고리별 상세 분석
 * - 시각화를 위한 데이터 가공
 * 
 * @author Ju Eul Park (rope-park)
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../../shared/middleware/auth';
import { ApiResponse } from '@finance-tracker/shared';
import { AnalyticsRepository } from './analytics.repository';
import logger from '../../shared/utils/logger';

/**
 * 분석 컨트롤러 클래스
 * 
 * 사용자의 재정 데이터를 분석하여 다양한 인사이트를 제공하는 메서드들을 포함.
 */
export class AnalyticsController {
  private analyticsRepo: AnalyticsRepository;

  constructor() {
    this.analyticsRepo = new AnalyticsRepository();
  }

  // 분석 요약 가져오기
  async getAnalyticsSummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: '권한이 없습니다.',
          timestamp: new Date().toISOString()
        };
        res.status(401).json(response);
        return;
      }

      const summary = await this.analyticsRepo.getUserAnalyticsSummary(userId);
      
      const response: ApiResponse = {
        success: true,
        data: { summary },
        message: '분석 요약이 성공적으로 조회되었습니다.',
        timestamp: new Date().toISOString()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error getting analytics summary:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to get analytics summary',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  }

  // 거래 추세 가져오기
  async getSpendingTrends(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { period = '6months' } = req.query;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: '권한이 없습니다.',
          timestamp: new Date().toISOString()
        };
        res.status(401).json(response);
        return;
      }

      const trends = await this.analyticsRepo.getSpendingTrends(userId, period as string);
      
      const response: ApiResponse = {
        success: true,
        data: { trends },
        message: '거래 추세가 성공적으로 조회되었습니다.',
        timestamp: new Date().toISOString()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error getting spending trends:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to get spending trends',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  }

  // 카테고리별 인사이트 가져오기
  async getCategoryInsights(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { period = '1month' } = req.query;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: '권한이 없습니다.',
          timestamp: new Date().toISOString()
        };
        res.status(401).json(response);
        return;
      }

      const breakdown = await this.analyticsRepo.getCategoryBreakdown(userId, period as string);
      
      const response: ApiResponse = {
        success: true,
        data: { breakdown },
        message: '카테고리별 인사이트가 성공적으로 조회되었습니다.',
        timestamp: new Date().toISOString()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error getting category breakdown:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to get category breakdown',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  }
}