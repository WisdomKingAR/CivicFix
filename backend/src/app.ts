// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './core/config/env';
import { globalApiLimiter } from './core/middleware/rateLimiter';
import { errorHandler } from './core/middleware/errorHandler';

// Feature route modules
import authRoutes from './features/auth/auth.routes';
import usersRoutes from './features/users/users.routes';
import complaintsRoutes from './features/complaints/complaints.routes';
import authorityRoutes from './features/authority/authority.routes';
import clusteringRoutes from './features/clustering/clustering.routes';
import mapRoutes from './features/map/map.routes';
import aiRoutes from './features/ai/ai.routes';
import uploadRoutes from './features/upload/upload.routes';
import adminRoutes from './features/admin/admin.routes';

const app = express();

// 1. Security & Core Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10kb' })); // Body limit prevents large payload DoS
app.use(cookieParser());

// 2. Health check probe
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'CivicFix API',
    uptime: process.uptime(),
  });
});

// 3. Mount Feature API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', globalApiLimiter, usersRoutes);
app.use('/api/complaints', globalApiLimiter, complaintsRoutes);
app.use('/api/authority', globalApiLimiter, authorityRoutes);
app.use('/api/clusters', globalApiLimiter, clusteringRoutes);
app.use('/api/map', globalApiLimiter, mapRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', globalApiLimiter, adminRoutes);

// 4. 404 Fallback
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    code: 'NOT_FOUND',
  });
});

// 5. Centralized Error Handler (must be last)
app.use(errorHandler);

export default app;
