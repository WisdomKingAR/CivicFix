// src/scripts/backfill-priority.ts
import { ComplaintStatus } from '@prisma/client';
import { prisma } from '../core/database/prisma';
import { PriorityService } from '../features/clustering/priority.service';

/**
 * Recalculates 4-factor priority score for all active (non-terminal) complaint clusters.
 * Called on periodic cron schedule or via protected Admin endpoint.
 */
export async function recalculateOpenClustersPriority(): Promise<{
  totalEvaluated: number;
  updatedCount: number;
}> {
  const clusters = await prisma.complaintCluster.findMany({
    where: {
      status: { notIn: [ComplaintStatus.RESOLVED, ComplaintStatus.REJECTED] },
    },
    select: {
      id: true,
      category: true,
      complaintCount: true,
      priorityScore: true,
      createdAt: true,
    },
  });

  let updatedCount = 0;
  for (const cluster of clusters) {
    const oldScore = cluster.priorityScore;
    const newScore = await PriorityService.recalculate(cluster.id);
    console.log(
      `[PrioritySync] Cluster [${cluster.id.slice(0, 8)}] ${cluster.category} | Reports: ${
        cluster.complaintCount
      } | Score: ${oldScore} -> ${newScore}`
    );
    updatedCount++;
  }

  return { totalEvaluated: clusters.length, updatedCount };
}

export async function main() {
  console.log('🔄 Starting priority score recalculation for active complaint clusters...');
  const { totalEvaluated, updatedCount } = await recalculateOpenClustersPriority();
  console.log(`✅ Completed recalculating ${updatedCount} of ${totalEvaluated} open clusters.`);
}

if (require.main === module) {
  main()
    .catch((err) => {
      console.error('❌ Backfill failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
