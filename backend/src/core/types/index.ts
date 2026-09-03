// src/core/types/index.ts
import { Role } from '@prisma/client';

export interface APIResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface APIError {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

export interface AuthUserPayload {
  id: string;
  email: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}
