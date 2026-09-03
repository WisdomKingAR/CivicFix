// src/features/auth/auth.schema.ts
import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .trim(),
    email: z
      .string()
      .email('Invalid email address format')
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one numerical digit'),
    phone: z.string().max(20).optional(),
    role: z.enum(['CITIZEN', 'AUTHORITY']).default('CITIZEN'),
    jurisdiction: z.string().max(100).optional(),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z
      .string()
      .email('Invalid email format')
      .trim()
      .toLowerCase(),
    password: z.string().min(1, 'Password is required'),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
