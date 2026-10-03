// src/features/authority/authority.controller.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/database/prisma';
import { AuthorityService } from './authority.service';
import { sendSuccess, sendError } from '../../core/utils/response';

export class AuthorityController {
  public static async getStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const staff = await AuthorityService.getStaff();
      sendSuccess(res, staff);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch staff';
      sendError(res, msg, 500, 'STAFF_FETCH_FAILED');
    }
  }

  public static async getQueue(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, status, page, limit } = req.query;

      const result = await AuthorityService.getQueue({
        category: category as any,
        status: status as any,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 25,
      });

      sendSuccess(res, result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch queue';
      sendError(res, msg, 500, 'QUEUE_FETCH_FAILED');
    }
  }

  public static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
        return;
      }

      const { id } = req.params;
      const updated = await AuthorityService.updateStatus(id, req.user.id, req.body);
      sendSuccess(res, updated, 'Status updated successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Status update failed';
      sendError(res, msg, 400, 'STATUS_UPDATE_FAILED');
    }
  }

  public static async assignComplaint(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
        return;
      }

      let id = req.params.id;
      if (!id && req.body.clusterId) {
        const cluster = await prisma.complaintCluster.findUnique({
          where: { id: req.body.clusterId },
          include: { complaints: { take: 1, select: { id: true } } },
        });
        id = cluster?.complaints[0]?.id || req.body.clusterId;
      }

      if (!id) {
        sendError(res, 'Complaint ID or clusterId is required.', 400, 'MISSING_ID');
        return;
      }

      const assignedToId = req.body.assignedToId || req.user.id;
      const assignment = await AuthorityService.assignComplaint(id, req.user.id, {
        ...req.body,
        assignedToId,
      });
      sendSuccess(res, assignment, 'Complaint assigned successfully.', 200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Assignment failed';
      sendError(res, msg, 400, 'ASSIGNMENT_FAILED');
    }
  }

  public static async resolveComplaint(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
        return;
      }

      let id = req.params.id;
      if (!id && req.body.clusterId) {
        const cluster = await prisma.complaintCluster.findUnique({
          where: { id: req.body.clusterId },
          include: { complaints: { take: 1, select: { id: true } } },
        });
        id = cluster?.complaints[0]?.id || req.body.clusterId;
      }

      if (!id) {
        sendError(res, 'Complaint ID or clusterId is required.', 400, 'MISSING_ID');
        return;
      }

      const afterPhotoUrl = req.body.afterPhotoUrl || req.body.afterImageUrl;
      const result = await AuthorityService.resolveComplaint(id, req.user.id, {
        ...req.body,
        afterPhotoUrl,
      });
      sendSuccess(res, result, 'Resolution verified and processed.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Resolution processing failed';
      sendError(res, msg, 500, 'RESOLUTION_FAILED');
    }
  }
}
