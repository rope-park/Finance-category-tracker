import { UserService } from '../src/services/userService';
import { TransactionService } from '../src/services/transactionService';
import { NotificationService } from '../src/services/notificationService';
import pool from '../src/config/database';

describe('Services Unit Tests', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('UserService', () => {
    it('should have static methods', () => {
      expect(typeof UserService.findByEmail).toBe('function');
      expect(typeof UserService.findById).toBe('function');
      expect(typeof UserService.create).toBe('function');
      expect(typeof UserService.updateProfile).toBe('function');
    });
  });

  describe('TransactionService', () => {
    it('should have static methods', () => {
      expect(typeof TransactionService.createTransaction).toBe('function');
      expect(typeof TransactionService.getTransactions).toBe('function');
      expect(typeof TransactionService.updateTransaction).toBe('function');
      expect(typeof TransactionService.deleteTransaction).toBe('function');
      expect(typeof TransactionService.getTransactionById).toBe('function');
    });
  });

  describe('NotificationService', () => {
    it('should have static methods', () => {
      expect(typeof NotificationService.sendNotification).toBe('function');
      expect(typeof NotificationService.getUserNotifications).toBe('function');
      expect(typeof NotificationService.markAsRead).toBe('function');
    });
  });
});
