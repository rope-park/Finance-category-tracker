/**
 * 거래 자동 카테고리 분류 서비스
 * 
 * AI/ML을 활용하여 거래 내역의 설명과 상점 정보를 분석해서
 * 자동으로 적절한 카테고리를 예측하고 분류하는 서비스.
 * 
 * 주요 기능:
 * - 거래 설명 텍스트 분석
 * - 머신러닝 기반 카테고리 예측
 * - 신뢰도 점수 제공
 * - 자동 분류된 거래 생성
 * 
 * @author Ju Eul Park (rope-park)
 */

import { predictCategory, CategoryPrediction } from '../../shared/ml/categoryPredictor';
import { TransactionRepository, CreateTransactionData, TransactionRecord } from '../transactions/transaction.repository';

/**
 * 자동 카테고리 분류 서비스 클래스
 * 
 * ML 예측 모델을 사용해서 거래 데이터 자동 분류하고
 * 적절한 카테고리를 할당하는 비즈니스 로직 담당.
 */
export class CategoryAutoService {
  /**
   * 자동 카테고리 예측 메서드
   * @param data - 분석할 거래 데이터 (설명, 상점명 등)
   * @returns 예측된 카테고리와 신뢰도 점수
   */
  static async autoCategorizeTransaction(data: CreateTransactionData): Promise<{ category: string; confidence: number }> {
    // 거래 설명과 상점명을 하나의 텍스트로 합치기
    const text = [data.description, (data as any).merchant].filter(Boolean).join(' ');
    
    // TODO: 모델을 사용해서 카테고리 예측
    const prediction: CategoryPrediction = predictCategory(text);
    
    return prediction;
  }

  /**
   * 자동 카테고리 분류와 함께 거래 생성하는 메서드
   * 
   * 카테고리가 지정되지 않은 거래 데이터를 받아서
   * 자동으로 카테고리를 예측하고 거래를 생성함.
   * 
   * @param data - 카테고리 없는 거래 생성 데이터
   * @returns 생성된 거래 레코드
   */
  static async createWithAutoCategory(data: Omit<CreateTransactionData, 'category_id'>): Promise<TransactionRecord> {
    // 자동 카테고리 예측 수행
    const prediction = await this.autoCategorizeTransaction(data as CreateTransactionData);
    
    // 거래 저장소 인스턴스 생성
    const repo = new TransactionRepository();
    
    // 예측된 카테고리와 함께 거래 생성
    return repo.createTransaction({ ...data, category_id: prediction.category });
  }
}
