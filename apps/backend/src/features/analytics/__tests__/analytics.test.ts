import { AnalyticsService } from '../analytics.service';
import { AnalyticsRepository } from '../analytics.repository';

describe('Analytics Service', () => {
  let analyticsService: AnalyticsService;
  let mockRepository: jest.Mocked<AnalyticsRepository>;

  beforeEach(() => {
    analyticsService = new AnalyticsService();
  });

  describe('getUserAnalyticsSummary', () => {
    it('should return analytics summary for user', async () => {
      const userId = 1;
      const expectedSummary = {
        totalTransactions: 10,
        totalExpenses: 1000,
        totalIncome: 2000,
        avgMonthlySpending: 500,
        topCategory: 'food',
        budgetUtilization: 75
      };

      // Mock repository response
      jest.spyOn(analyticsService['analyticsRepo'], 'getUserAnalyticsSummary')
        .mockResolvedValue(expectedSummary);

      const result = await analyticsService.getUserAnalyticsSummary(userId);

      expect(result).toEqual(expectedSummary);
    });
  });

  describe('getSpendingTrends', () => {
    it('should return spending trends for user', async () => {
      const userId = 1;
      const period = '6months';
      const expectedTrends = [
        { month: '2024-01', amount: 500, category: 'food' },
        { month: '2024-02', amount: 600, category: 'transport' }
      ];

      jest.spyOn(analyticsService['analyticsRepo'], 'getSpendingTrends')
        .mockResolvedValue(expectedTrends);

      const result = await analyticsService.getSpendingTrends(userId, period);

      expect(result).toEqual(expectedTrends);
    });
  });

  describe('getCategoryBreakdown', () => {
    it('should return category breakdown for user', async () => {
      const userId = 1;
      const period = '1month';
      const expectedBreakdown = [
        { category: 'food', amount: 300, percentage: 60, transactionCount: 15 },
        { category: 'transport', amount: 200, percentage: 40, transactionCount: 8 }
      ];

      jest.spyOn(analyticsService['analyticsRepo'], 'getCategoryBreakdown')
        .mockResolvedValue(expectedBreakdown);

      const result = await analyticsService.getCategoryBreakdown(userId, period);

      expect(result).toEqual(expectedBreakdown);
    });
  });
});