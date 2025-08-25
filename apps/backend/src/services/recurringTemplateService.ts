import { RecurringTemplateRepository, CreateRecurringTemplateData } from '../repositories/RecurringTemplateRepository';

export class RecurringTemplateService {
  private static repo = new RecurringTemplateRepository();

  static async createTemplate(data: CreateRecurringTemplateData) {
    return this.repo.createTemplate(data);
  }

  static async getTemplates(userId: number) {
    return this.repo.findByUser(userId);
  }

  static async updateTemplate(id: number, userId: number, data: Partial<CreateRecurringTemplateData>) {
    return this.repo.updateTemplate(id, userId, data);
  }

  static async deleteTemplate(id: number, userId: number) {
    return this.repo.deleteTemplate(id, userId);
  }
}