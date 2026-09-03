// backend/src/features/ratna/ratna.routes.ts
import { Router } from 'express';
import { RatnaController } from './ratna.controller';
import { authenticateToken } from '../../core/middleware/auth.middleware';

const router = Router();

// Public / Citizen routes
router.get('/leaderboard', RatnaController.getLeaderboard);
router.get('/me', authenticateToken, RatnaController.getMyStats);
router.post('/redeem', authenticateToken, RatnaController.redeemCoupon);

export default router;
