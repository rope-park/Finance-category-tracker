
import { BudgetRepository, CreateBudgetData, UpdateBudgetData, BudgetRecord } from '../repositories/BudgetRepository';

export class BudgetService {
  private static repo = new BudgetRepository();

  static async getBudgets(userId: number): Promise<BudgetRecord[]> {
    const { budgets } = await this.repo.findManyBudgets({ user_id: userId });
    return budgets;
  }

  static async getBudgetById(budgetId: number, userId: number): Promise<BudgetRecord | null> {
    return this.repo.findById(budgetId, userId);
  }

  static async createBudget(data: CreateBudgetData): Promise<BudgetRecord> {
    return this.repo.createBudget(data);
  }

  static async updateBudget(budgetId: number, userId: number, data: UpdateBudgetData): Promise<BudgetRecord | null> {
    return this.repo.updateBudget(budgetId, userId, data);
  }

  static async deleteBudget(budgetId: number, userId: number): Promise<boolean> {
    return this.repo.deleteBudget(budgetId, userId);
  }
}
