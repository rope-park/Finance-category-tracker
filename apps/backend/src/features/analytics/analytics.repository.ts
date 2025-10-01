import { BaseRepository } from '../../shared/repositories/BaseRepository';
import { Pool } from 'pg';
import logger from '../../shared/utils/logger';

export interface AnalyticsSummary {
  totalTransactions: number;
  totalExpenses: number;
  totalIncome: number;
  avgMonthlySpending: number;
  topCategory: string;
  budgetUtilization: number;
}

export interface SpendingTrend {
  month: string;
  amount: number;
  category: string;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export class AnalyticsRepository {
  private pool: any;
  
  constructor() {
    const poolModule = require('../../core/config/database');
    this.pool = poolModule.default || poolModule;
  }
  
  async getUserAnalyticsSummary(userId: number): Promise<AnalyticsSummary> {
    const client = await this.pool.connect();
    try {
      // Get total transactions
      const transactionQuery = `
        SELECT 
          COUNT(*) as total_transactions,
          SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) as total_expenses,
          SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) as total_income
        FROM transactions 
        WHERE user_id = $1
      `;
      const transactionResult = await client.query(transactionQuery, [userId]);
      
      // Get top category
      const categoryQuery = `
        SELECT category_key, SUM(amount) as total
        FROM transactions 
        WHERE user_id = $1 AND transaction_type = 'expense'
        GROUP BY category_key 
        ORDER BY total DESC 
        LIMIT 1
      `;
      const categoryResult = await client.query(categoryQuery, [userId]);
      
      // Get average monthly spending
      const avgQuery = `
        SELECT AVG(monthly_expense) as avg_monthly
        FROM (
          SELECT 
            DATE_TRUNC('month', transaction_date) as month,
            SUM(amount) as monthly_expense
          FROM transactions 
          WHERE user_id = $1 AND transaction_type = 'expense'
          GROUP BY DATE_TRUNC('month', transaction_date)
        ) monthly_totals
      `;
      const avgResult = await client.query(avgQuery, [userId]);

      return {
        totalTransactions: parseInt(transactionResult.rows[0]?.total_transactions || '0'),
        totalExpenses: parseFloat(transactionResult.rows[0]?.total_expenses || '0'),
        totalIncome: parseFloat(transactionResult.rows[0]?.total_income || '0'),
        avgMonthlySpending: parseFloat(avgResult.rows[0]?.avg_monthly || '0'),
        topCategory: categoryResult.rows[0]?.category_key || 'N/A',
        budgetUtilization: 0 // TODO: Calculate from budget data
      };
    } catch (error) {
      logger.error('Error getting analytics summary:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getSpendingTrends(userId: number, period: string): Promise<SpendingTrend[]> {
    const client = await this.pool.connect();
    try {
      let dateFilter = '';
      switch (period) {
        case '6months':
          dateFilter = "AND transaction_date >= NOW() - INTERVAL '6 months'";
          break;
        case '1year':
          dateFilter = "AND transaction_date >= NOW() - INTERVAL '1 year'";
          break;
        default:
          dateFilter = "AND transaction_date >= NOW() - INTERVAL '6 months'";
      }

      const query = `
        SELECT 
          TO_CHAR(DATE_TRUNC('month', transaction_date), 'YYYY-MM') as month,
          category_key as category,
          SUM(amount) as amount
        FROM transactions 
        WHERE user_id = $1 AND transaction_type = 'expense' ${dateFilter}
        GROUP BY DATE_TRUNC('month', transaction_date), category_key
        ORDER BY month DESC, amount DESC
      `;
      
      const result = await client.query(query, [userId]);
      return result.rows;
    } catch (error) {
      logger.error('Error getting spending trends:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getCategoryBreakdown(userId: number, period: string): Promise<CategoryBreakdown[]> {
    const client = await this.pool.connect();
    try {
      let dateFilter = '';
      switch (period) {
        case '1month':
          dateFilter = "AND transaction_date >= NOW() - INTERVAL '1 month'";
          break;
        case '3months':
          dateFilter = "AND transaction_date >= NOW() - INTERVAL '3 months'";
          break;
        case '1year':
          dateFilter = "AND transaction_date >= NOW() - INTERVAL '1 year'";
          break;
        default:
          dateFilter = "AND transaction_date >= NOW() - INTERVAL '1 month'";
      }

      const query = `
        WITH category_totals AS (
          SELECT 
            category_key as category,
            SUM(amount) as amount,
            COUNT(*) as transaction_count
          FROM transactions 
          WHERE user_id = $1 AND transaction_type = 'expense' ${dateFilter}
          GROUP BY category_key
        ),
        total_spending AS (
          SELECT SUM(amount) as total FROM category_totals
        )
        SELECT 
          ct.category,
          ct.amount,
          ct.transaction_count,
          ROUND((ct.amount / ts.total * 100)::numeric, 2) as percentage
        FROM category_totals ct
        CROSS JOIN total_spending ts
        ORDER BY ct.amount DESC
      `;
      
      const result = await client.query(query, [userId]);
      return result.rows.map(row => ({
        category: row.category,
        amount: parseFloat(row.amount),
        percentage: parseFloat(row.percentage),
        transactionCount: parseInt(row.transaction_count)
      }));
    } catch (error) {
      logger.error('Error getting category breakdown:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}