// backend/src/features/ratna/ratna.service.ts
import { prisma } from '../../core/database/prisma';
import { RatnaEvent } from '@prisma/client';

export const RATNA_REWARD_MAP: Record<RatnaEvent, number> = {
  COMPLAINT_SUBMITTED: 5,
  CLUSTER_JOINED: 2,
  COMPLAINT_RESOLVED: 10,
  RESOLUTION_CONFIRMED: 20,
  RESOLUTION_REJECTED_CORRECTLY: 15,
  REFERRAL_BONUS: 25,
  QUALITY_PHOTO: 1,
};

export class RatnaService {
  /**
   * Atomically awards Ratna points to a user and logs the transaction.
   */
  public static async award(
    userId: string,
    event: RatnaEvent,
    complaintId?: string,
    note?: string
  ): Promise<number> {
    const amount = RATNA_REWARD_MAP[event] ?? 5;

    try {
      await prisma.$transaction([
        prisma.ratnaLedger.create({
          data: {
            userId,
            event,
            ratna: amount,
            complaintId,
            note: note || `Awarded for ${event.replace(/_/g, ' ').toLowerCase()}`,
          },
        }),
        prisma.user.update({
          where: { id: userId },
          data: {
            ratnaTotal: { increment: amount },
          },
        }),
      ]);

      return amount;
    } catch (err) {
      console.warn(`⚠️ Failed to award Ratna (${event}) to user ${userId}:`, err);
      return 0;
    }
  }

  /**
   * Retrieves high-ranking citizens sorted by accumulated Ratna points.
   */
  public static async getLeaderboard(
    scope: 'city' | 'ward' = 'city',
    ward?: string,
    limit = 50
  ) {
    return prisma.user.findMany({
      where: {
        role: 'CITIZEN',
        isFlagged: false,
        ...(scope === 'ward' && ward ? { jurisdiction: ward } : {}),
      },
      orderBy: { ratnaTotal: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        ratnaTotal: true,
        jurisdiction: true,
        createdAt: true,
        _count: { select: { complaints: true } },
      },
    });
  }

  /**
   * Retrieves current balance, tier, and transaction ledger for a citizen.
   */
  public static async getUserStats(userId: string) {
    const [user, ledger, coupons] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, ratnaTotal: true, role: true },
      }),
      prisma.ratnaLedger.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 25,
        include: {
          complaint: {
            select: { id: true, category: true, address: true },
          },
        },
      }),
      prisma.coupon.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const total = user?.ratnaTotal ?? 0;

    // Calculate Tier
    let tierName = 'Nagarik (नागरिक)';
    let tierLevel = 1;
    let nextTierPoints = 50;

    if (total >= 1000) {
      tierName = 'Lok Mitra (लोक मित्र)';
      tierLevel = 5;
      nextTierPoints = 1000;
    } else if (total >= 500) {
      tierName = 'Rakshal (रक्षक)';
      tierLevel = 4;
      nextTierPoints = 1000;
    } else if (total >= 200) {
      tierName = 'Prahari (प्रहरी)';
      tierLevel = 3;
      nextTierPoints = 500;
    } else if (total >= 50) {
      tierName = 'Sevak (सेवक)';
      tierLevel = 2;
      nextTierPoints = 200;
    }

    return {
      total,
      tierName,
      tierLevel,
      nextTierPoints,
      history: ledger,
      coupons,
    };
  }

  /**
   * Deducts Ratna and issues an instant partner coupon code.
   */
  public static async redeemCoupon(
    userId: string,
    ratnaSpent: number,
    partner: string,
    value: number
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.ratnaTotal < ratnaSpent) {
      throw new Error('Insufficient Ratna balance to redeem this coupon.');
    }

    const code = `RATNA-${partner.substring(0, 3).toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const [coupon] = await prisma.$transaction([
      prisma.coupon.create({
        data: {
          userId,
          code,
          partner,
          value,
          ratnaSpent,
          expiresAt,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          ratnaTotal: { decrement: ratnaSpent },
        },
      }),
    ]);

    return coupon;
  }
}
