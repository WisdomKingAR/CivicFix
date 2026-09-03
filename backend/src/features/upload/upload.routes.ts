// src/features/upload/upload.routes.ts
import { Router } from 'express';
import { UploadController } from './upload.controller';
import { authenticateToken } from '../../core/middleware/auth.middleware';
import { upload } from '../../core/middleware/multer';
import { uploadLimiter } from '../../core/middleware/rateLimiter';

const router = Router();

router.use(authenticateToken);
router.use(uploadLimiter);

router.post('/', upload.single('image'), UploadController.uploadImage);

export default router;
