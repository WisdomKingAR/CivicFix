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
    clusterId: z.string().optional(),
    assignedToId: z.string().optional(),
    workerName: z.string().optional(),
    estimatedResolutionDate: z.string().optional(),
    notes: z.string().max(500).optional(),
  });

export const resolveComplaintSchema = z
  .object({
    clusterId: z.string().optional(),
    afterPhotoUrl: z.string().url('After repair photo URL must be valid').optional(),
    afterImageUrl: z.string().url('After repair photo URL must be valid').optional(),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => data.afterPhotoUrl || data.afterImageUrl, {
    message: 'Either afterPhotoUrl or afterImageUrl is required',
    path: ['afterImageUrl'],
  });

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type AssignComplaintInput = z.infer<typeof assignComplaintSchema>;
export type ResolveComplaintInput = z.infer<typeof resolveComplaintSchema>;
