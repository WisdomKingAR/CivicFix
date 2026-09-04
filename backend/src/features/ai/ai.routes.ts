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

// Authority and Admins can evaluate images
router.post(
  '/compare-images',
  requireRole(Role.AUTHORITY, Role.ADMIN),
  AIController.compareImages
);

router.post(
  '/classify-image',
  requireRole(Role.AUTHORITY, Role.ADMIN),
  AIController.classifyImage
);

export default router;
