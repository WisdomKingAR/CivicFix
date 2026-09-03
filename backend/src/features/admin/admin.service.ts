// src/features/admin/admin.service.ts
import { ComplaintStatus } from '@prisma/client';
import { prisma } from '../../core/database/prisma';
import { UpdateUserInput } from './admin.schema';

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

  public static async getAnalytics() {
    const [
      totalComplaints,
      resolvedComplaints,
      inProgressComplaints,
      underReviewComplaints,
      flaggedUsersCount,
      categoryStats,
      clusters,
    ] = await Promise.all([
      prisma.complaint.count(),
      prisma.complaint.count({ where: { status: ComplaintStatus.RESOLVED } }),
      prisma.complaint.count({ where: { status: ComplaintStatus.IN_PROGRESS } }),
      prisma.complaint.count({ where: { status: ComplaintStatus.UNDER_REVIEW } }),
      prisma.user.count({ where: { isFlagged: true } }),
      prisma.complaint.groupBy({
        by: ['category'],
        _count: { category: true },
      }),
      prisma.complaintCluster.findMany({
        select: { priorityScore: true },
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

    return {
      overview: {
        totalComplaints,
        resolvedComplaints,
        inProgressComplaints,
        underReviewComplaints,
        resolutionRate,
        flaggedUsersCount,
        avgPriorityScore,
      },
      categoryDistribution: categoryStats.map((stat) => ({
        category: stat.category,
        count: stat._count.category,
      })),
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
