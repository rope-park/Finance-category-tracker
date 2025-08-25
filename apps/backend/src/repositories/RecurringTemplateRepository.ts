

import { BaseRepository } from './BaseRepository';

export interface RecurringTemplate {
  id: number;
  user_id: number;
  category_key: string;
  transaction_type: 'income' | 'expense';
  amount: number;
  description?: string;
  merchant?: string;
  start_date: Date;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  next_occurrence: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateRecurringTemplateData {
  user_id: number;
  category_key: string;
  transaction_type: 'income' | 'expense';
  amount: number;
  description?: string;
  merchant?: string;
  start_date: Date;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
}

export class RecurringTemplateRepository extends BaseRepository {
  private readonly tableName = 'recurring_templates';

  async createTemplate(data: CreateRecurringTemplateData): Promise<RecurringTemplate> {
    return await super.create<RecurringTemplate>(this.tableName, {
      ...data,
      is_active: true,
      next_occurrence: data.start_date,
    });
  }

  async findByUser(user_id: number): Promise<RecurringTemplate[]> {
    return await super.findMany<RecurringTemplate>(this.tableName, { user_id, is_active: true });
  }

  async updateTemplate(id: number, user_id: number, data: Partial<CreateRecurringTemplateData>): Promise<RecurringTemplate | null> {
    return await super.update<RecurringTemplate>(this.tableName, data, { id, user_id });
  }

  async deleteTemplate(id: number, user_id: number): Promise<boolean> {
    return await super.delete(this.tableName, { id, user_id });
  }

  async updateNextOccurrence(id: number, next_occurrence: Date): Promise<void> {
    await this.db.query(
      `UPDATE recurring_templates SET next_occurrence = $1, updated_at = NOW() WHERE id = $2`,
      [next_occurrence, id]
    );
  }
}