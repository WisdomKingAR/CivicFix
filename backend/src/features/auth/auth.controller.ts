// src/features/auth/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess, sendError } from '../../core/utils/response';
import { env } from '../../core/config/env';

const REFRESH_COOKIE_NAME = 'civicfix_refresh_token';

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);

      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      sendSuccess(
        res,
        { user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken },
        'User registered successfully.',
        201
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      sendError(res, message, 400, 'REGISTRATION_ERROR');
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);

      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(
        res,
        { user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken },
        'Logged in successfully.'
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid credentials';
      sendError(res, message, 401, 'INVALID_CREDENTIALS');
    }
  }

  public static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
      if (!refreshToken) {
        sendError(res, 'Missing refresh token.', 401, 'UNAUTHORIZED');
        return;
      }

      const { accessToken } = AuthService.refreshAccessToken(refreshToken);
      sendSuccess(res, { accessToken }, 'Access token refreshed.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Token refresh failed';
      sendError(res, message, 401, 'REFRESH_FAILED');
    }
  }

  public static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie(REFRESH_COOKIE_NAME, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      sendSuccess(res, null, 'Logged out successfully.');
    } catch (err) {
      next(err);
    }
  }
}
