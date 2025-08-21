export * from './BaseRepository';
export * from './UserRepository';
export * from './TransactionRepository';
export * from './BudgetRepository';

// 싱글톤 인스턴스들
import { UserRepository } from './UserRepository';
import { TransactionRepository } from './TransactionRepository';
import { BudgetRepository } from './BudgetRepository';

export const userRepository = new UserRepository();
export const transactionRepository = new TransactionRepository();
export const budgetRepository = new BudgetRepository();
