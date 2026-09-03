// src/core/middleware/rbac.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { sendError } from '../utils/response';

/**
 * Role-Based Access Control Middleware.
 * Ensures the authenticated user possesses one of the allowed roles.
 */
export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401, 'UNAUTHORIZED');
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        `Forbidden: Access requires one of [${allowedRoles.join(', ')}] role.`,
        403,
        'FORBIDDEN'
      );
      return;
    }

    next();
  };
};
