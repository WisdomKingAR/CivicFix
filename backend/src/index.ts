// src/index.ts
import { validateEnv, env } from './core/config/env';
import app from './app';
import { prisma } from './core/database/prisma';

// Validate required environment variables immediately at boot
validateEnv();

const server = app.listen(env.PORT, () => {
  console.log(`
🚀 ===================================================
🏛  CIVICFIX BACKEND INITIALIZED SUCCESSFULLY
📡 Port: ${env.PORT}
🌍 Environment: ${env.NODE_ENV}
🔒 CORS Origin: ${env.FRONTEND_URL}
===================================================
  `);
});

// Graceful shutdown handling
const handleShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('🔌 HTTP server closed.');
    await prisma.$disconnect();
    console.log('🗄️ Database connections closed.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('⚠️ Forcing shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
