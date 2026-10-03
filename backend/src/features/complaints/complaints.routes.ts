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

// Route aliases from test prompt (4.8 POST /api/complaints/:id/confirm)
router.post(
  '/:id/confirm',
  validate(confirmResolutionSchema),
  ComplaintsController.confirmResolution
);

router.post(
  '/:id/confirm-resolution',
  validate(confirmResolutionSchema),
  ComplaintsController.confirmResolution
);

export default router;
