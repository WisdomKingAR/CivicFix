// src/features/clustering/clustering.routes.ts
import { Router } from 'express';
import { ClusteringController } from './clustering.controller';
import { authenticateToken } from '../../core/middleware/auth.middleware';
import { requireRole } from '../../core/middleware/rbac.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateToken);

// Authority officers and Admins can view clusters
router.get(
  '/',
  requireRole(Role.AUTHORITY, Role.ADMIN),
  ClusteringController.listClusters
);

router.get(
  '/:id',
  requireRole(Role.AUTHORITY, Role.ADMIN),
  ClusteringController.getClusterById
);

export default router;
