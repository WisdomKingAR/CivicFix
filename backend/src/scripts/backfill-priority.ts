// src/scripts/backfill-priority.ts
import { prisma } from '../core/database/prisma';
import { PriorityService } from '../features/clustering/priority.service';

async function main() {
  console.log('🔄 Starting priority score recalculation for all complaint clusters...');

  const clusters = await prisma.complaintCluster.findMany({
    select: {
      id: true,
      category: true,
      complaintCount: true,
      priorityScore: true,
      createdAt: true,
    },
  });

  console.log(`📊 Found ${clusters.length} clusters to evaluate.`);

  let updatedCount = 0;
  for (const cluster of clusters) {
    const oldScore = cluster.priorityScore;
    const newScore = await PriorityService.recalculate(cluster.id);
    console.log(
      `Cluster [${cluster.id.slice(0, 8)}] Category: ${cluster.category} | Reports: ${
        cluster.complaintCount
      } | Score: ${oldScore} -> ${newScore}`
    );
    updatedCount++;
  }

  console.log(`✅ Completed recalculating ${updatedCount} clusters with the new 4-factor scoring model.`);
}

main()
  .catch((err) => {
    console.error('❌ Backfill failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
