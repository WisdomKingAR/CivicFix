// src/features/ai/ai.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AIService } from './ai.service';
import { sendSuccess, sendError } from '../../core/utils/response';

export class AIController {
  public static async compareImages(req: Request, res: Response, next: NextFunction) {
    try {
      const { beforePhotoUrl, afterPhotoUrl } = req.body;

      if (!beforePhotoUrl || !afterPhotoUrl) {
        sendError(
          res,
          'Both beforePhotoUrl and afterPhotoUrl are required for comparison.',
          400,
          'MISSING_IMAGES'
        );
        return;
      }

      const result = await AIService.compareImages(beforePhotoUrl, afterPhotoUrl);
      sendSuccess(res, result, 'Image comparison evaluation completed.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Comparison evaluation failed';
      sendError(res, msg, 500, 'AI_EVALUATION_FAILED');
    }
  }

  public static async classifyImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { photoUrl } = req.body;

      if (!photoUrl) {
        sendError(res, 'photoUrl is required for classification.', 400, 'MISSING_IMAGE');
        return;
      }

      const result = await AIService.analyzeImageForCategory(photoUrl);
      sendSuccess(res, result, 'Image classified successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Image classification failed';
      sendError(res, msg, 500, 'CLASSIFICATION_FAILED');
    }
  }

  public static async healthCheck(req: Request, res: Response, next: NextFunction) {
    try {
      const { getGeminiModel } = await import('../../core/external/gemini');
      const model = getGeminiModel();
      if (!model) {
        sendError(res, 'GEMINI_API_KEY not configured.', 503, 'AI_UNAVAILABLE');
        return;
      }
      const ping = await model.generateContent('Reply with the word OK only.');
      const text = ping.response.text().trim();
      sendSuccess(res, { status: 'ok', response: text, model: 'gemini-2.0-flash' }, 'Gemini reachable.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gemini quota or connection error';
      sendError(res, msg, 503, 'AI_QUOTA_OR_KEY_ERROR');
    }
  }
}
