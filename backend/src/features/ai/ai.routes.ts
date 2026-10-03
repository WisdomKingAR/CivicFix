// src/features/ai/ai.routes.ts
import { Router } from 'express';
import { AIController } from './ai.controller';
import { authenticateToken } from '../../core/middleware/auth.middleware';
import { requireRole } from '../../core/middleware/rbac.middleware';
import { aiLimiter } from '../../core/middleware/rateLimiter';
import { Role } from '@prisma/client';

const router = Router();

// Public health check route (rate limited by aiLimiter)
router.get('/health', aiLimiter, AIController.healthCheck);

router.use(authenticateToken);
router.use(aiLimiter);

// Any authenticated user can auto-categorize an image (test 7.1 uses CITIZEN_TOKEN)
router.post('/categorize', AIController.classifyImage);
router.post('/classify-image', AIController.classifyImage); // legacy alias

// Authority and Admins can compare images (before/after verification)
router.post(
  '/compare',
  requireRole(Role.AUTHORITY, Role.ADMIN),
  AIController.compareImages
);
router.post(
  '/compare-images',
  requireRole(Role.AUTHORITY, Role.ADMIN),
  AIController.compareImages
); // legacy alias

export default router;
