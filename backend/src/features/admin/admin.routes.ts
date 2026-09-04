// src/features/admin/admin.routes.ts
import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticateToken } from '../../core/middleware/auth.middleware';
import { requireRole } from '../../core/middleware/rbac.middleware';
import { validate } from '../../core/middleware/validate';
import { updateUserSchema } from './admin.schema';
import { Role } from '@prisma/client';
import { adminApiLimiter } from '../../core/middleware/rateLimiter';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(Role.ADMIN));

router.get('/users', AdminController.listUsers);
router.patch('/users/:id', validate(updateUserSchema), AdminController.updateUser);

router.get('/analytics', AdminController.getAnalytics);
router.get('/spam', AdminController.getSpamReport);

// Periodic or manual priority score drift recalculation
router.post('/recalculate-priorities', adminApiLimiter, AdminController.recalculatePriorities);

export default router;
