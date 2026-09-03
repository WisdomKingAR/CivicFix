// src/features/authority/authority.routes.ts
import { Router } from 'express';
import { AuthorityController } from './authority.controller';
import { authenticateToken } from '../../core/middleware/auth.middleware';
import { requireRole } from '../../core/middleware/rbac.middleware';
import { validate } from '../../core/middleware/validate';
import {
  updateStatusSchema,
  assignComplaintSchema,
  resolveComplaintSchema,
} from './authority.schema';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(Role.AUTHORITY, Role.ADMIN));

router.get('/queue', AuthorityController.getQueue);

router.put(
  '/complaints/:id/status',
  validate(updateStatusSchema),
  AuthorityController.updateStatus
);

router.post(
  '/complaints/:id/assign',
  validate(assignComplaintSchema),
  AuthorityController.assignComplaint
);

router.post(
  '/complaints/:id/resolve',
  validate(resolveComplaintSchema),
  AuthorityController.resolveComplaint
);

export default router;
