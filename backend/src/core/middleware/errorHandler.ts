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

  if (err.name === 'MulterError' || err.message?.includes('Unsupported file format')) {
    sendError(res, `File upload error: ${err.message}`, 400, 'UPLOAD_ERROR');
    return;
  }

  // Express body-parser limit exceeded (Test 11.2 expects 413 Payload Too Large)
  if ((err as any).type === 'entity.too.large' || (err as any).status === 413) {
    sendError(res, 'Payload Too Large: request body exceeds 10kb limit', 413, 'PAYLOAD_TOO_LARGE');
    return;
  }

  const message =
    env.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred.'
      : err.message || 'Internal server error';

  sendError(res, message, 500, 'INTERNAL_SERVER_ERROR');
};
