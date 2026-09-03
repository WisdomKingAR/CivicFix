// src/features/users/users.controller.ts
import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { sendSuccess, sendError } from '../../core/utils/response';

export class UsersController {
  public static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
        return;
      }

      const profile = await UsersService.getProfile(req.user.id);
      sendSuccess(res, profile);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve profile';
      sendError(res, msg, 404, 'NOT_FOUND');
    }
  }

  public static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
        return;
      }

      const updated = await UsersService.updateProfile(req.user.id, req.body);
      sendSuccess(res, updated, 'Profile updated successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      sendError(res, msg, 400, 'UPDATE_FAILED');
    }
  }
}
