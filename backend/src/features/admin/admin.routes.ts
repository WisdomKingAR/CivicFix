// src/features/admin/admin.routes.ts
import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticateToken } from '../../core/middleware/auth.middleware';
import { requireRole } from '../../core/middleware/rbac.middleware';
import { validate } from '../../core/middleware/validate';
import { updateUserSchema, updateUserStatusSchema } from './admin.schema';
import { Role } from '@prisma/client';
import { adminApiLimiter } from '../../core/middleware/rateLimiter';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(Role.ADMIN));

router.get('/users', AdminController.listUsers);
router.patch('/users/:id', validate(updateUserSchema), AdminController.updateUser);
// Test 9.3 uses PATCH /api/admin/users/:userId/status with { status: "UNDER_REVIEW" }
router.patch('/users/:id/status', validate(updateUserStatusSchema), AdminController.updateUser);

router.get('/analytics', AdminController.getAnalytics);
router.get('/spam', AdminController.getSpamReport);

// Periodic or manual priority score drift recalculation
router.post('/recalculate-priorities', adminApiLimiter, AdminController.recalculatePriorities);

export default router;
