// src/features/clustering/priority.service.ts
import { prisma } from '../../core/database/prisma';

const SENSITIVE_RADIUS_HIGH_METERS = 500;
const SENSITIVE_RADIUS_MED_METERS = 1000;

export class PriorityService {
  /**
   * Recalculates priority score (1–100) for a complaint cluster.
   * Priority Score = (duplicate_weight * 40) + (proximity_weight * 30) + (age_weight * 30)
   */
  public static async recalculate(clusterId: string): Promise<number> {
    const cluster = await prisma.complaintCluster.findUnique({
      where: { id: clusterId },
      include: { complaints: true },
    });

    if (!cluster) return 0;

    // 1. Duplicate Factor (40%): maxed out at 10 complaints
    const duplicateWeight = Math.min(cluster.complaintCount / 10, 1.0);

    // 2. Age Factor (30%): reaches maximum after 7 days
    const ageInDays = (Date.now() - cluster.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const ageWeight = Math.min(ageInDays / 7, 1.0);

    // 3. Proximity to sensitive locations (30%) via PostGIS ST_Distance query
    let proximityWeight = 0;
    try {
      const nearResult = await prisma.$queryRaw<Array<{ proximity_weight: number }>>`
        SELECT
          CASE
            WHEN MIN(ST_Distance(
              ST_MakePoint(${cluster.centroidLng}, ${cluster.centroidLat})::geography,
              ST_MakePoint(lng, lat)::geography
            )) <= ${SENSITIVE_RADIUS_HIGH_METERS} THEN 1.0
            WHEN MIN(ST_Distance(
              ST_MakePoint(${cluster.centroidLng}, ${cluster.centroidLat})::geography,
              ST_MakePoint(lng, lat)::geography
            )) <= ${SENSITIVE_RADIUS_MED_METERS} THEN 0.5
            ELSE 0.0
          END AS proximity_weight
        FROM sensitive_locations;
      `;

      if (nearResult && nearResult.length > 0 && nearResult[0].proximity_weight !== null) {
        proximityWeight = Number(nearResult[0].proximity_weight) || 0;
      }
    } catch (err) {
      // In local dev without active PostGIS extension, fallback to Euclidean distance
      const sensitiveList = await prisma.sensitiveLocation.findMany();
      for (const loc of sensitiveList) {
        const dLat = (loc.lat - cluster.centroidLat) * 111000; // rough meters
        const dLng =
          (loc.lng - cluster.centroidLng) *
          111000 *
          Math.cos((cluster.centroidLat * Math.PI) / 180);
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);

        if (dist <= SENSITIVE_RADIUS_HIGH_METERS) {
          proximityWeight = 1.0;
          break;
        } else if (dist <= SENSITIVE_RADIUS_MED_METERS) {
          proximityWeight = Math.max(proximityWeight, 0.5);
        }
      }
    }

    const calculatedScore = Math.round(
      duplicateWeight * 40 + proximityWeight * 30 + ageWeight * 30
    );

    await prisma.complaintCluster.update({
      where: { id: clusterId },
      data: {
        priorityScore: calculatedScore,
        isNearSensitive: proximityWeight > 0,
      },
    });

    return calculatedScore;
  }
}
