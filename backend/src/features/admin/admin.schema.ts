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

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
