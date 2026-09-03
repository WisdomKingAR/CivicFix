// src/features/complaints/complaints.routes.ts
import { Router } from 'express';
import { ComplaintsController } from './complaints.controller';
import { authenticateToken } from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate';
import { createComplaintSchema, confirmResolutionSchema } from './complaints.schema';
import { complaintSubmitLimiter } from '../../core/middleware/rateLimiter';

const router = Router();

router.use(authenticateToken);

router.post(
  '/',
  complaintSubmitLimiter,
  validate(createComplaintSchema),
  ComplaintsController.createComplaint
);

router.get('/', ComplaintsController.getMyComplaints);
router.get('/:id', ComplaintsController.getComplaintById);

router.put(
  '/:id/confirm-resolution',
  validate(confirmResolutionSchema),
  ComplaintsController.confirmResolution
);

export default router;
