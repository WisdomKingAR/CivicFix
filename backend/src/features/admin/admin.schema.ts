// src/features/admin/admin.schema.ts
import { z } from 'zod';

export const updateUserSchema = z
  .object({
    role: z.enum(['CITIZEN', 'AUTHORITY', 'ADMIN']).optional(),
    isFlagged: z.boolean().optional(),
    flagReason: z.string().max(255).optional(),
    jurisdiction: z.string().max(100).optional(),
  })
  .strict();

// Used by PATCH /users/:id/status — maps status string to isFlagged boolean
export const updateUserStatusSchema = z
  .object({
    status: z.enum(['ACTIVE', 'UNDER_REVIEW', 'SUSPENDED']),
    reason: z.string().max(255).optional(),
  })
  .strict();

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;

