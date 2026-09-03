// src/features/admin/spam.service.ts
import { prisma } from '../../core/database/prisma';

export interface SpamCheckResult {
  isSpam: boolean;
  reason: string | null;
}

export class SpamService {
  /**
   * Evaluates 3 spam/abuse prevention heuristics:
   * 1. Hourly volume > 10 submissions from same account
   * 2. Spatial burst > 3 submissions within 100m in last 10 minutes
   * 3. Identical photo hash within last 24h
   */
  public static async checkSpamPatterns(
    userId: string,
    lat: number,
    lng: number,
    photoHash: string
  ): Promise<SpamCheckResult> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Heuristic 1: Hourly limit exceeded
    const hourlyCount = await prisma.complaint.count({
      where: {
        userId,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (hourlyCount >= 10) {
      return {
        isSpam: true,
        reason: 'Rate limit exceeded: More than 10 complaints reported in 1 hour.',
      };
    }

    // Heuristic 2: Spatial duplicate burst within 100m in 10 minutes
    try {
      const nearbyRecent = await prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(*)::int AS count
        FROM complaints
        WHERE "userId" = ${userId}
          AND "createdAt" >= ${tenMinutesAgo}
          AND ST_DWithin(
            ST_MakePoint(${lng}, ${lat})::geography,
            ST_MakePoint(lng, lat)::geography,
            100
          );
      `;

      if (nearbyRecent && nearbyRecent.length > 0 && nearbyRecent[0].count >= 3) {
        return {
          isSpam: true,
          reason: 'Rapid geo-burst: 3 or more complaints reported within 100m in 10 minutes.',
        };
      }
    } catch {
      // Fallback Euclidean calculation for non-PostGIS local DB
      const recentNearby = await prisma.complaint.findMany({
        where: {
          userId,
          createdAt: { gte: tenMinutesAgo },
        },
      });

      let closeCount = 0;
      for (const comp of recentNearby) {
        const dLat = (comp.lat - lat) * 111000;
        const dLng = (comp.lng - lng) * 111000 * Math.cos((lat * Math.PI) / 180);
        if (Math.sqrt(dLat * dLat + dLng * dLng) <= 100) {
          closeCount++;
        }
      }

      if (closeCount >= 3) {
        return {
          isSpam: true,
          reason: 'Rapid geo-burst: 3 or more complaints reported within 100m in 10 minutes.',
        };
      }
    }

    // Heuristic 3: Repeated identical image within 24 hours
    const duplicatePhoto = await prisma.complaint.findFirst({
      where: {
        userId,
        photoHash,
        createdAt: { gte: oneDayAgo },
      },
    });

    if (duplicatePhoto) {
      return {
        isSpam: true,
        reason: 'Duplicate photo: An identical photo was already uploaded by this account in the last 24 hours.',
      };
    }

    return { isSpam: false, reason: null };
  }
}
