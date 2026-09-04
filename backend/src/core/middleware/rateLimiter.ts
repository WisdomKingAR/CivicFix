// src/core/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

const createRateLimiter = (
  windowMs: number,
  max: number,
  message = 'Too many requests. Please try again later.',
  extraOptions: Partial<Parameters<typeof rateLimit>[0]> = {}
) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true, // Return standard RateLimit headers
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        error: message,
        code: 'RATE_LIMITED',
      });
    },
    ...extraOptions,
  });
};

// 1. Auth Login: 50 requests / 15 minutes, skips successful logins so only failed attempts count
export const authLoginLimiter = createRateLimiter(
  15 * 60 * 1000,
  50,
  'Too many failed login attempts. Please try again after 15 minutes.',
  {
    skipSuccessfulRequests: true,
    keyGenerator: (req: Request) => {
      const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
      return `${req.ip}_${email}`;
    },
  }
);

// 2. Auth Register: 30 requests / 1 hour (account farming defense)
export const authRegisterLimiter = createRateLimiter(
  60 * 60 * 1000,
  30,
  'Too many accounts registered from this IP. Please try again after an hour.'
);

// 3. Complaint Submission: 30 requests / 1 hour (spam submission defense)
export const complaintSubmitLimiter = createRateLimiter(
  60 * 60 * 1000,
  30,
  'Submission limit reached (30 complaints per hour). Please wait before reporting more.'
);

// 4. Global API (authenticated): 100 requests / 1 minute
export const globalApiLimiter = createRateLimiter(
  60 * 1000,
  100,
  'High traffic detected. Please slow down your requests.'
);

// 5. AI Operations: 10 requests / 1 minute (Gemini quota protection)
export const aiLimiter = createRateLimiter(
  60 * 1000,
  10,
  'AI service rate limit exceeded. Please wait a minute before analyzing more images.'
);

// 6. Upload Operations: 5 requests / 1 minute (Cloudinary storage abuse protection)
export const uploadLimiter = createRateLimiter(
  60 * 1000,
  5,
  'Upload limit reached (5 images per minute). Please wait a moment.'
);

// 7. Admin Operations: 30 requests / 15 minutes (sensitive batch/recalculation protection)
export const adminApiLimiter = createRateLimiter(
  15 * 60 * 1000,
  30,
  'Admin rate limit exceeded. Please wait a few minutes.'
);

