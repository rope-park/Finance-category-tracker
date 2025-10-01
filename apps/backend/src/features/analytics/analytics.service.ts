import { AnalyticsRepository } from './analytics.repository';
import logger from '../../shared/utils/logger';

export class AnalyticsService {
  private analyticsRepo: AnalyticsRepository;

  constructor() {
    this.analyticsRepo = new AnalyticsRepository();
  }

  async getUserAnalyticsSummary(userId: number) {
    try {
      return await this.analyticsRepo.getUserAnalyticsSummary(userId);
    } catch (error) {
      logger.error('Analytics service error getting summary:', error);
      throw error;
    }
  }

  async getSpendingTrends(userId: number, period: string = '6months') {
    try {
      return await this.analyticsRepo.getSpendingTrends(userId, period);
    } catch (error) {
      logger.error('Analytics service error getting trends:', error);
      throw error;
    }
  }

  async getCategoryBreakdown(userId: number, period: string = '1month') {
    try {
      return await this.analyticsRepo.getCategoryBreakdown(userId, period);
    } catch (error) {
      logger.error('Analytics service error getting breakdown:', error);
      throw error;
    }
  }

  async generateInsights(userId: number) {
    try {
      const [summary, trends, breakdown] = await Promise.all([
        this.getUserAnalyticsSummary(userId),
        this.getSpendingTrends(userId, '6months'),
        this.getCategoryBreakdown(userId, '3months')
      ]);

      // Generate insights based on data
      const insights = [];

      // Top spending category insight
      if (breakdown.length > 0) {
        const topCategory = breakdown[0];
        insights.push({
          type: 'spending_pattern',
          title: 'Top Spending Category',
          message: `You spend most on ${topCategory.category} (${topCategory.percentage}% of expenses)`,
          category: topCategory.category,
          impact: topCategory.percentage > 30 ? 'high' : 'medium'
        });
      }

      // Monthly average insight
      if (summary.avgMonthlySpending > 0) {
        insights.push({
          type: 'monthly_average',
          title: 'Monthly Spending Average',
          message: `Your average monthly spending is $${summary.avgMonthlySpending.toFixed(2)}`,
          amount: summary.avgMonthlySpending,
          impact: 'info'
        });
      }

      return {
        summary,
        trends,
        breakdown,
        insights
      };
    } catch (error) {
      logger.error('Analytics service error generating insights:', error);
      throw error;
    }
  }
}