// src/features/map/map.routes.ts
import { Router } from 'express';
import { MapController } from './map.controller';
import { authenticateToken } from '../../core/middleware/auth.middleware';

const router = Router();

// Public / Authenticated map view
router.use(authenticateToken);
router.get('/complaints', MapController.getMapData);

export default router;
