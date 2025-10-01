// 거래 설명 기반 자동 카테고리 분류 서비스
import { predictCategory, CategoryPrediction } from '../../shared/ml/categoryPredictor';
import { TransactionRepository, CreateTransactionData, TransactionRecord } from '../transactions/transaction.repository';

export class CategoryAutoService {
  static async autoCategorizeTransaction(data: CreateTransactionData): Promise<{ category: string; confidence: number }> {
    // description, merchant 등 텍스트 기반으로 예측
    const text = [data.description, (data as any).merchant].filter(Boolean).join(' ');
    const prediction: CategoryPrediction = predictCategory(text);
    return prediction;
  }

  static async createWithAutoCategory(data: Omit<CreateTransactionData, 'category_id'>): Promise<TransactionRecord> {
    const prediction = await this.autoCategorizeTransaction(data as CreateTransactionData);
    const repo = new TransactionRepository();
    return repo.createTransaction({ ...data, category_id: prediction.category });
  }
}
