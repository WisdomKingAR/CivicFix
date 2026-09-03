// src/features/authority/authority.schema.ts
import { z } from 'zod';

export const updateStatusSchema = z
  .object({
    status: z.enum([
      'SUBMITTED',
      'UNDER_REVIEW',
      'ASSIGNED',
      'IN_PROGRESS',
      'RESOLVED',
      'REJECTED',
    ]),
    notes: z.string().max(500).optional(),
  })
  .strict();

export const assignComplaintSchema = z
  .object({
    assignedToId: z.string().min(1, 'Assigned user ID is required'),
    notes: z.string().max(500).optional(),
  })
  .strict();

export const resolveComplaintSchema = z
  .object({
    afterPhotoUrl: z.string().url('After repair photo URL must be valid'),
    notes: z.string().max(500).optional(),
  })
  .strict();

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type AssignComplaintInput = z.infer<typeof assignComplaintSchema>;
export type ResolveComplaintInput = z.infer<typeof resolveComplaintSchema>;
