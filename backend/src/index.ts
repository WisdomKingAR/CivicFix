// src/index.ts
import { validateEnv, env } from './core/config/env';
import app from './app';
import { prisma } from './core/database/prisma';

// Validate required environment variables immediately at boot
validateEnv();

// Recalculate 4-factor priority score for all active clusters every 6 hours
// Combats SLA Aging milestone drift without requiring manual triggers
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const priorityRecalculationTimer = setInterval(async () => {
  try {
    const { recalculateOpenClustersPriority } = await import('./scripts/backfill-priority');
    console.log('[PriorityScheduler] ⏰ Initiating scheduled priority score drift recalculation...');
    const result = await recalculateOpenClustersPriority();
    console.log(
      `[PriorityScheduler] ✅ Completed priority recalculation. Evaluated: ${result.totalEvaluated}, Updated: ${result.updatedCount}`
    );
  } catch (err) {
    console.error('[PriorityScheduler] ❌ Priority recalculation job failed:', err);
  }
}, SIX_HOURS_MS);

if (priorityRecalculationTimer.unref) {
  priorityRecalculationTimer.unref();
}

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
  clearInterval(priorityRecalculationTimer);
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
