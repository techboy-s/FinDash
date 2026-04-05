import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);
router.use(requireRole(['VIEWER', 'ANALYST', 'ADMIN']));

// GET /api/analytics/summary
router.get('/summary', analyticsController.getSummary);

// GET /api/analytics/categories
router.get('/categories', analyticsController.getCategoryBreakdown);

// GET /api/analytics/trends
router.get('/trends', analyticsController.getMonthlyTrends);

export default router;
