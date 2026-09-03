// src/features/auth/auth.routes.ts
import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../core/middleware/validate';
import { registerSchema, loginSchema } from './auth.schema';
import { authLoginLimiter, authRegisterLimiter } from '../../core/middleware/rateLimiter';
import { authenticateToken } from '../../core/middleware/auth.middleware';

const router = Router();

router.post(
  '/register',
  authRegisterLimiter,
  validate(registerSchema),
  AuthController.register
);

router.post(
  '/login',
  authLoginLimiter,
  validate(loginSchema),
  AuthController.login
);

router.post('/refresh', AuthController.refresh);

router.delete('/logout', authenticateToken, AuthController.logout);

export default router;
