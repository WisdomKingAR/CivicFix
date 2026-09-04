// src/features/map/map.routes.ts
import { Router } from 'express';
import { MapController } from './map.controller';
import { authenticateToken } from '../../core/middleware/auth.middleware';

const router = Router();

// Public map and incident transparency endpoints (rate limited by globalApiLimiter)
router.get('/complaints', MapController.getMapData);
router.get('/summary', MapController.getMapSummary);

export default router;
