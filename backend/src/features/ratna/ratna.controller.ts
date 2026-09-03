// backend/src/features/ratna/ratna.controller.ts
import { Request, Response } from 'express';
import { RatnaService } from './ratna.service';
import { sendSuccess, sendError } from '../../core/utils/response';

export class RatnaController {
  public static async getMyStats(req: Request, res: Response) {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
        return;
      }
      const stats = await RatnaService.getUserStats(req.user.id);
      sendSuccess(res, stats);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve Ratna statistics';
      sendError(res, msg, 500, 'RATNA_STATS_ERROR');
    }
  }

  public static async getLeaderboard(req: Request, res: Response) {
    try {
      const scope = (req.query.scope as 'city' | 'ward') || 'city';
      const ward = req.query.ward as string | undefined;
      const limit = parseInt(req.query.limit as string, 10) || 50;

      const board = await RatnaService.getLeaderboard(scope, ward, limit);
      sendSuccess(res, board);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve leaderboard';
      sendError(res, msg, 500, 'LEADERBOARD_ERROR');
    }
  }

  public static async redeemCoupon(req: Request, res: Response) {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
        return;
      }

      const { ratnaCost, partner, value } = req.body;
      if (!ratnaCost || !partner || !value) {
        sendError(res, 'Missing required coupon redemption parameters.', 400, 'INVALID_INPUT');
        return;
      }

      const coupon = await RatnaService.redeemCoupon(req.user.id, ratnaCost, partner, value);
      sendSuccess(res, coupon, `Successfully redeemed ${partner} coupon!`, 201);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Coupon redemption failed';
      sendError(res, msg, 400, 'REDEEM_ERROR');
    }
  }
}
