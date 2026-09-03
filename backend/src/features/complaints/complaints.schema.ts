// src/features/complaints/complaints.schema.ts
import { z } from 'zod';

export const createComplaintSchema = z
  .object({
    category: z.enum([
      'POTHOLE',
      'STREETLIGHT',
      'GARBAGE',
      'WATER_LEAKAGE',
      'ROAD_DAMAGE',
      'OTHER',
    ]),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description must not exceed 1000 characters')
      .trim(),
    photoUrl: z.string().url('Photo URL must be a valid URL'),
    lat: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
    lng: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
    address: z.string().max(500).optional(),
  })
  .strict();

export const confirmResolutionSchema = z
  .object({
    confirmed: z.boolean(),
    feedback: z.string().max(500).optional(),
  })
  .strict();

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
export type ConfirmResolutionInput = z.infer<typeof confirmResolutionSchema>;
