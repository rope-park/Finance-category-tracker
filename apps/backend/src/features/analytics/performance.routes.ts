import { Router } from 'express';
import { authenticateToken } from '../../shared/middleware/auth';

const router = Router();

// Apply authentication middleware
router.use(authenticateToken);

// Performance monitoring routes
router.get('/metrics', async (req, res) => {
  try {
    // Basic performance metrics
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    };

    res.json({
      success: true,
      data: metrics,
      message: 'Performance metrics retrieved',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get performance metrics',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;