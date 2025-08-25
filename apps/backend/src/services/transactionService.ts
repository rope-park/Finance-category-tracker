
import { TransactionRepository, CreateTransactionData, UpdateTransactionData, TransactionFilters, TransactionRecord } from '../repositories/TransactionRepository';

export class TransactionService {
  private static repo = new TransactionRepository();

  static async getTransactions(userId: number, filters: TransactionFilters = {}): Promise<{ transactions: TransactionRecord[]; total: number }> {
    return this.repo.findWithFilters({ ...filters, user_id: userId });
  }

  static async getTransactionById(transactionId: number, userId: number): Promise<TransactionRecord | null> {
    return this.repo.findById(transactionId, userId);
  }

  static async createTransaction(data: CreateTransactionData): Promise<TransactionRecord> {
    return this.repo.createTransaction(data);
  }

  static async updateTransaction(transactionId: number, userId: number, data: UpdateTransactionData): Promise<TransactionRecord | null> {
    return this.repo.updateTransaction(transactionId, userId, data);
  }

  static async deleteTransaction(transactionId: number, userId: number): Promise<boolean> {
    return this.repo.deleteTransaction(transactionId, userId);
  }

  static async getTransactionStats(userId: number, startDate?: Date, endDate?: Date) {
    return this.repo.getStatistics(userId, startDate, endDate);
  }

    static async getTopCategories(userId: number, startDate?: Date, endDate?: Date) {
      return this.repo.getCategorySummary(userId, startDate, endDate);
    }
  }
