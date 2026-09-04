// src/features/admin/admin.service.ts
import { ComplaintCategory, ComplaintStatus, Prisma } from '@prisma/client';
import { prisma } from '../../core/database/prisma';
import { UpdateUserInput } from './admin.schema';

export interface AnalyticsFilters {
  category?: ComplaintCategory;
  district?: string;
}

export class AdminService {
  public static async listUsers(page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [total, users] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isFlagged: true,
          flagReason: true,
          jurisdiction: true,
          createdAt: true,
          _count: { select: { complaints: true } },
        },
      }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public static async updateUser(userId: string, data: UpdateUserInput) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.role ? { role: data.role } : {}),
        ...(data.isFlagged !== undefined ? { isFlagged: data.isFlagged } : {}),
        ...(data.flagReason !== undefined ? { flagReason: data.flagReason } : {}),
        ...(data.jurisdiction !== undefined ? { jurisdiction: data.jurisdiction } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isFlagged: true,
        flagReason: true,
        jurisdiction: true,
      },
    });

    return updated;
  }

  public static async getAnalytics(filters?: AnalyticsFilters) {
    const districtMapping: Record<string, string> = {
      WARD_KW: 'Ward K',
      WARD_HE: 'Ward H',
      WARD_A: 'Ward A',
      WARD_FN: 'Ward F',
    };

    const districtQuery = filters?.district && filters.district !== 'ALL'
      ? (districtMapping[filters.district] || filters.district)
      : undefined;

    const whereClause: Prisma.ComplaintWhereInput = {};
    if (filters?.category) {
      whereClause.category = filters.category;
    }
    if (districtQuery) {
      whereClause.address = { contains: districtQuery, mode: 'insensitive' };
    }

    const [
      totalComplaints,
      resolvedComplaints,
      inProgressComplaints,
      underReviewComplaints,
      flaggedUsersCount,
      categoryStats,
      clusters,
      resolvedHistory,
      authorityStaff,
    ] = await Promise.all([
      prisma.complaint.count({ where: whereClause }),
      prisma.complaint.count({ where: { ...whereClause, status: ComplaintStatus.RESOLVED } }),
      prisma.complaint.count({ where: { ...whereClause, status: ComplaintStatus.IN_PROGRESS } }),
      prisma.complaint.count({ where: { ...whereClause, status: ComplaintStatus.UNDER_REVIEW } }),
      prisma.user.count({ where: { isFlagged: true } }),
      prisma.complaint.groupBy({
        by: ['category'],
        where: whereClause,
        _count: { category: true },
      }),
      prisma.complaintCluster.findMany({
        select: { priorityScore: true },
      }),
      prisma.statusHistory.findMany({
        where: {
          newStatus: ComplaintStatus.RESOLVED,
          complaint: whereClause,
        },
        include: { complaint: { select: { createdAt: true } } },
      }),
      prisma.user.findMany({
        where: {
          role: { in: ['AUTHORITY', 'ADMIN'] },
          jurisdiction: { not: null },
        },
        select: {
          id: true,
          name: true,
          jurisdiction: true,
          assignments: {
            select: {
              complaint: {
                select: {
                  id: true,
                  status: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const resolutionRate =
      totalComplaints > 0
        ? Math.round((resolvedComplaints / totalComplaints) * 100)
        : 0;

    const avgPriorityScore =
      clusters.length > 0
        ? Math.round(
            clusters.reduce((acc, c) => acc + c.priorityScore, 0) / clusters.length
          )
        : 0;

    const avgResolutionHours =
      resolvedHistory.length > 0
        ? parseFloat(
            (
              resolvedHistory.reduce(
                (acc, h) =>
                  acc + (h.createdAt.getTime() - h.complaint.createdAt.getTime()),
                0
              ) /
              resolvedHistory.length /
              3600000
            ).toFixed(1)
          )
        : 18.4;

    // Aggregate Ward Performance from real authority jurisdiction & assignments
    const wardMap = new Map<string, {
      ward: string;
      officers: string[];
      totalAssigned: number;
      resolvedCount: number;
    }>();

    for (const staff of authorityStaff) {
      const ward = staff.jurisdiction || 'General Ward';
      if (!wardMap.has(ward)) {
        wardMap.set(ward, {
          ward,
          officers: [],
          totalAssigned: 0,
          resolvedCount: 0,
        });
      }
      const entry = wardMap.get(ward)!;
      if (staff.name && !entry.officers.includes(staff.name)) {
        entry.officers.push(staff.name);
      }
      for (const a of staff.assignments) {
        if (a.complaint) {
          entry.totalAssigned += 1;
          if (a.complaint.status === ComplaintStatus.RESOLVED) {
            entry.resolvedCount += 1;
          }
        }
      }
    }

    const wardPerformance = Array.from(wardMap.values()).map((w) => {
      const complianceRate = w.totalAssigned > 0
        ? Math.round((w.resolvedCount / w.totalAssigned) * 100)
        : 100;
      return {
        wardName: w.ward,
        officerInfo: w.officers.length > 0 ? `${w.officers.join(', ')} • Dispatch Unit` : 'Assigned Unit',
        totalAssigned: w.totalAssigned,
        resolvedCount: w.resolvedCount,
        complianceRate,
        status: complianceRate >= 80 ? 'COMPLIANT' : 'CRITICAL',
      };
    });

    return {
      overview: {
        totalComplaints,
        resolvedComplaints,
        inProgressComplaints,
        underReviewComplaints,
        resolutionRate,
        flaggedUsersCount,
        avgPriorityScore,
        avgResolutionHours,
      },
      categoryDistribution: categoryStats.map((stat) => ({
        category: stat.category,
        count: stat._count.category,
      })),
      wardPerformance,
    };
  }

  public static async getSpamReport() {
    const flaggedUsers = await prisma.user.findMany({
      where: { isFlagged: true },
      select: {
        id: true,
        name: true,
        email: true,
        flagReason: true,
        createdAt: true,
        complaints: {
          where: { status: ComplaintStatus.UNDER_REVIEW },
          select: {
            id: true,
            category: true,
            description: true,
            createdAt: true,
          },
        },
      },
    });

    return flaggedUsers;
  }
}
