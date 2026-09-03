// src/features/users/users.schema.ts
import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    name: z.string().min(2).max(100).trim().optional(),
    phone: z.string().max(20).trim().optional(),
  })
  .strict();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
