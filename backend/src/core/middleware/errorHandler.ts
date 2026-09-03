// src/core/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { env } from '../config/env';

/**
 * Global Express error handling middleware.
 * Ensures zero stack-trace leakage in production.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  console.error(`[Error] ${req.method} ${req.url}:`, err.message);

  if (err.name === 'MulterError') {
    sendError(res, `File upload error: ${err.message}`, 400, 'UPLOAD_ERROR');
    return;
  }

  const message =
    env.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred.'
      : err.message || 'Internal server error';

  sendError(res, message, 500, 'INTERNAL_SERVER_ERROR');
};
