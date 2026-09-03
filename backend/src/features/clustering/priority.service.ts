// src/features/clustering/priority.service.ts
import { prisma } from '../../core/database/prisma';
import { ComplaintCategory } from '@prisma/client';

const SENSITIVE_RADIUS_HIGH_METERS = 500;
const SENSITIVE_RADIUS_MED_METERS = 1000;

// Category-specific inherent hazard severity (0.0 to 1.0)
const HAZARD_SCORES: Record<ComplaintCategory, number> = {
  WATER_LEAKAGE: 1.0,  // Critical infrastructure, disease risk, erosion
  POTHOLE: 0.9,        // Immediate vehicular & pedestrian accident risk
  ROAD_DAMAGE: 0.85,    // Structural roadway collapse/barrier breakage
  STREETLIGHT: 0.65,    // Night crime risk, vehicular visibility
  GARBAGE: 0.5,        // Hygiene/health issue, vector breeding
  OTHER: 0.4,          // Miscellaneous civic issues
};

// Expected resolution SLA in days before aging score hits maximum
const SLA_DAYS: Record<ComplaintCategory, number> = {
  WATER_LEAKAGE: 1,    // 24-hour critical turnaround
  POTHOLE: 3,          // 72 hours
  ROAD_DAMAGE: 3,      // 72 hours
  STREETLIGHT: 4,      // 96 hours
  GARBAGE: 5,          // 5 days
  OTHER: 7,            // 7 days
};

export class PriorityService {
  /**
   * Recalculates priority score (1–100) for a complaint cluster.
   * 
   * Realistic 4-Factor Municipal Triage Model:
   *   Priority Score = (Hazard * 35) + (Volume * 25) + (Proximity * 25) + (SLA_Aging * 15)
   * 
   * 1. Hazard (35%): Inherent public safety impact of the issue type.
   * 2. Volume (25%): Crowd consensus curve: log2(count + 1) / log2(11).
   * 3. Proximity (25%): Proximity to schools and hospitals (<=500m -> 1.0, <=1000m -> 0.5).
   * 4. Aging (15%): Category-aware SLA breach progression (ageInDays / SLA_DAYS).
   */
  public static async recalculate(clusterId: string): Promise<number> {
    const cluster = await prisma.complaintCluster.findUnique({
      where: { id: clusterId },
      include: { complaints: true },
    });

    if (!cluster) return 0;

    // 1. Hazard Baseline Factor (35%)
    const hazardWeight = HAZARD_SCORES[cluster.category] ?? 0.5;

    // 2. Volume / Consensus Factor (25%) - Logarithmic scaling up to 10 complaints
    const volumeWeight = Math.min(
      Math.log2(cluster.complaintCount + 1) / Math.log2(11),
      1.0
    );

    // 3. Proximity to sensitive locations (25%) via PostGIS ST_Distance query
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

    // 4. SLA Aging Factor (15%) - Escalates as cluster age approaches/exceeds SLA
    const ageInDays = Math.max(
      0,
      (Date.now() - cluster.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    const slaTargetDays = SLA_DAYS[cluster.category] ?? 5;
    const ageWeight = Math.min(ageInDays / slaTargetDays, 1.0);

    // Sum weighted components to 0–100 scale
    const rawScore =
      hazardWeight * 35 +
      volumeWeight * 25 +
      proximityWeight * 25 +
      ageWeight * 15;

    const calculatedScore = Math.min(100, Math.max(1, Math.round(rawScore)));

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
