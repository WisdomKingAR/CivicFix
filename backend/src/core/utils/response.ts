// src/core/utils/response.ts
import { Response } from 'express';
import { APIResponse, APIError } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
): Response<APIResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(message ? { message } : {}),
  });
};

export const sendError = (
  res: Response,
  error: string,
  statusCode = 400,
  code?: string,
  details?: unknown
): Response<APIError> => {
  return res.status(statusCode).json({
    success: false,
    error,
    ...(code ? { code } : {}),
    ...(details ? { details } : {}),
  });
};
