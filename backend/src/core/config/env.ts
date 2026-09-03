// src/core/config/env.ts
/**
 * Environment configuration loader and fail-fast validator.
 * Enforces OWASP and Security Skill guidelines: fails immediately if required secrets are absent.
 */

interface EnvConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  FRONTEND_URL: string;
  DATABASE_URL: string;
  DIRECT_URL?: string;
  JWT_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  GEMINI_API_KEY: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
}

const requiredEnvVars = [
  'JWT_SECRET',
  'DATABASE_URL',
] as const;

// In non-production, supply safe fallbacks for optional services so dev builds work seamlessly
export const env: EnvConfig = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/civicfix',
  DIRECT_URL: process.env.DIRECT_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_secret_must_be_overridden_in_production_32chars',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
};

export function validateEnv(): void {
  if (env.NODE_ENV === 'production') {
    const missing: string[] = [];
    for (const key of requiredEnvVars) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }
    if (!process.env.GEMINI_API_KEY) missing.push('GEMINI_API_KEY');
    if (!process.env.CLOUDINARY_CLOUD_NAME) missing.push('CLOUDINARY_CLOUD_NAME');

    if (missing.length > 0) {
      throw new Error(
        `🚨 CRITICAL SECURITY FAULT: Missing required environment variables in production: ${missing.join(', ')}`
      );
    }
  }
}
