// src/features/admin/admin.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ComplaintCategory } from '@prisma/client';
import { AdminService } from './admin.service';
import { sendSuccess, sendError } from '../../core/utils/response';

export class AdminController {
  public static async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 50;

      const result = await AdminService.listUsers(page, limit);
      sendSuccess(res, result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve users';
      sendError(res, msg, 500, 'USERS_FETCH_FAILED');
    }
  }

  public static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await AdminService.updateUser(id, req.body);
      sendSuccess(res, updated, 'User updated successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update user';
      sendError(res, msg, 400, 'USER_UPDATE_FAILED');
    }
  }

  public static async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, district } = req.query;
      const analytics = await AdminService.getAnalytics({
        category: category && category !== 'ALL' ? (category as ComplaintCategory) : undefined,
        district: district && district !== 'ALL' ? String(district) : undefined,
      });
      sendSuccess(res, analytics);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to compute analytics';
      sendError(res, msg, 500, 'ANALYTICS_FAILED');
    }
  }

  public static async getSpamReport(req: Request, res: Response, next: NextFunction) {
    try {
      const spamReport = await AdminService.getSpamReport();
      sendSuccess(res, spamReport);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve spam report';
      sendError(res, msg, 500, 'SPAM_REPORT_FAILED');
    }
  }
}
