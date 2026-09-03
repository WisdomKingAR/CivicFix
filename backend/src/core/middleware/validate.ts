// src/core/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response';

/**
 * Generic Request Validation Middleware using Zod.
 * Rejects unexpected fields when schemas use .strict().
 */
export const validate = (
  schema: ZodSchema,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        sendError(
          res,
          'Validation failed: Invalid request payload.',
          400,
          'VALIDATION_ERROR',
          errorMessages
        );
        return;
      }

      sendError(res, 'Malformed request data.', 400, 'MALFORMED_INPUT');
    }
  };
};
