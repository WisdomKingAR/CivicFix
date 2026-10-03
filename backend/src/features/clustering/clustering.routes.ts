// src/features/clustering/clustering.routes.ts
import { Router } from 'express';
import { ClusteringController } from './clustering.controller';
import { authenticateToken } from '../../core/middleware/auth.middleware';
import { requireRole } from '../../core/middleware/rbac.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateToken);

// Any authenticated user can view clusters (CITIZEN, AUTHORITY, ADMIN)
router.get('/', ClusteringController.listClusters);
router.get('/:id', ClusteringController.getClusterById);

// Only admins can trigger a bulk priority recalculation
router.post(
  '/recalculate',
  requireRole(Role.ADMIN),
  ClusteringController.recalculateAllPriorities
);

export default router;
