// src/features/upload/upload.controller.ts
import { Request, Response, NextFunction } from 'express';
import { UploadService } from './upload.service';
import { sendSuccess, sendError } from '../../core/utils/response';

export class UploadController {
  public static async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        sendError(res, 'No image file uploaded.', 400, 'NO_FILE_PROVIDED');
        return;
      }

      const uploaded = await UploadService.uploadImage(req.file.buffer);
      sendSuccess(res, uploaded, 'Image uploaded successfully.', 201);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Image upload failed';
      sendError(res, msg, 500, 'UPLOAD_FAILED');
    }
  }
}
