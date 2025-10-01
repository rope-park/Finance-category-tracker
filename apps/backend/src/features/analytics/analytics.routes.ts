import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authenticateToken } from '../../shared/middleware/auth';

const router = Router();
const analyticsController = new AnalyticsController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Analytics routes
router.get('/summary', analyticsController.getAnalyticsSummary.bind(analyticsController));
router.get('/trends', analyticsController.getSpendingTrends.bind(analyticsController));
router.get('/breakdown', analyticsController.getCategoryInsights.bind(analyticsController));

export default router;