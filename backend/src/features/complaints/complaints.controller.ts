// src/features/complaints/complaints.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ComplaintsService } from './complaints.service';
import { sendSuccess, sendError } from '../../core/utils/response';

export class ComplaintsController {
  public static async createComplaint(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
        return;
      }

      const complaint = await ComplaintsService.createComplaint(req.user.id, req.body);
      sendSuccess(res, complaint, 'Complaint submitted successfully.', 201);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Complaint submission failed';
      sendError(res, msg, 400, 'SUBMISSION_FAILED');
    }
  }

  public static async getMyComplaints(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
        return;
      }

      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;

      const result = await ComplaintsService.getMyComplaints(req.user.id, page, limit);
      sendSuccess(res, result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch complaints';
      sendError(res, msg, 500, 'FETCH_FAILED');
    }
  }

  public static async getComplaintById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const complaint = await ComplaintsService.getComplaintById(id);
      sendSuccess(res, complaint);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Complaint not found';
      sendError(res, msg, 404, 'NOT_FOUND');
    }
  }

  public static async confirmResolution(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
        return;
      }

      const { id } = req.params;
      const updated = await ComplaintsService.confirmResolution(id, req.user.id, req.body);
      sendSuccess(res, updated, 'Resolution confirmation recorded.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Resolution confirmation failed';
      sendError(res, msg, 400, 'CONFIRMATION_FAILED');
    }
  }
}
