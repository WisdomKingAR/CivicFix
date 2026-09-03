// src/features/users/users.routes.ts
import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticateToken } from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate';
import { updateProfileSchema } from './users.schema';

const router = Router();

router.use(authenticateToken);

router.get('/me', UsersController.getMe);
router.put('/profile', validate(updateProfileSchema), UsersController.updateProfile);

export default router;
