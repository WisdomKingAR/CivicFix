// src/features/complaints/complaints.service.ts
import { ComplaintStatus } from '@prisma/client';
import { prisma } from '../../core/database/prisma';
import { CreateComplaintInput, ConfirmResolutionInput } from './complaints.schema';
import { sha256 } from '../../core/utils/hash';
import { SpamService } from '../admin/spam.service';
import { ClusteringService } from '../clustering/clustering.service';
import { NotificationService } from '../admin/notification.service';

export class ComplaintsService {
  public static async createComplaint(userId: string, data: CreateComplaintInput) {
    const photoHash = sha256(data.photoUrl);

    // 1. Run spam heuristic checks
    const spamCheck = await SpamService.checkSpamPatterns(
      userId,
      data.lat,
      data.lng,
      photoHash
    );

    let initialStatus: ComplaintStatus = ComplaintStatus.SUBMITTED;

    if (spamCheck.isSpam) {
      initialStatus = ComplaintStatus.UNDER_REVIEW;
      await prisma.user.update({
        where: { id: userId },
        data: {
          isFlagged: true,
          flagReason: spamCheck.reason,
        },
      });
      console.warn(`🚨 Flagged complaint as SPAM for user ${userId}: ${spamCheck.reason}`);
    }

    // 2. Perform duplicate clustering & priority scoring
    const clusterResult = await ClusteringService.clusterComplaint({
      id: '',
      lat: data.lat,
      lng: data.lng,
      photoUrl: data.photoUrl,
      category: data.category,
    });

    // 3. Create Complaint record
    const complaint = await prisma.complaint.create({
      data: {
        userId,
        category: data.category,
        description: data.description,
        photoUrl: data.photoUrl,
        photoHash,
        lat: data.lat,
        lng: data.lng,
        address: data.address,
        status: initialStatus,
        clusterId: clusterResult.clusterId,
        isSeed: clusterResult.isSeed,
        statusHistory: {
          create: {
            oldStatus: initialStatus,
            newStatus: initialStatus,
            changedById: userId,
            notes: spamCheck.isSpam
              ? `Flagged for manual review: ${spamCheck.reason}`
              : 'Complaint submitted by citizen.',
          },
        },
      },
      include: {
        cluster: true,
        statusHistory: true,
      },
    });

    return complaint;
  }

  public static async getMyComplaints(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [total, complaints] = await Promise.all([
      prisma.complaint.count({ where: { userId } }),
      prisma.complaint.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          cluster: true,
          resolution: true,
          statusHistory: { orderBy: { createdAt: 'asc' } },
        },
      }),
    ]);

    return {
      complaints,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public static async getComplaintById(id: string) {
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        cluster: true,
        assignments: {
          include: {
            assignedTo: { select: { id: true, name: true, jurisdiction: true } },
          },
        },
        resolution: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!complaint) {
      throw new Error('Complaint not found.');
    }

    return complaint;
  }

  public static async confirmResolution(
    complaintId: string,
    userId: string,
    data: ConfirmResolutionInput
  ) {
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: { resolution: true },
    });

    if (!complaint) {
      throw new Error('Complaint not found.');
    }

    if (complaint.userId !== userId) {
      throw new Error('You do not have permission to confirm this resolution.');
    }

    const newStatus = data.confirmed
      ? ComplaintStatus.RESOLVED
      : ComplaintStatus.IN_PROGRESS;

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update verification record if present
      if (complaint.resolution) {
        await tx.resolutionVerification.update({
          where: { complaintId },
          data: {
            citizenConfirmed: data.confirmed,
            verifiedAt: data.confirmed ? new Date() : null,
          },
        });
      }

      // 2. Update complaint status
      const updatedComp = await tx.complaint.update({
        where: { id: complaintId },
        data: { status: newStatus },
      });

      // 3. Append to status audit trail
      await tx.statusHistory.create({
        data: {
          complaintId,
          oldStatus: complaint.status,
          newStatus,
          changedById: userId,
          notes: data.confirmed
            ? `Citizen confirmed resolution: ${data.feedback || 'Looks good'}`
            : `Citizen rejected resolution: ${data.feedback || 'Issue remains unresolved'}`,
        },
      });

      return updatedComp;
    });

    if (!data.confirmed) {
      await NotificationService.notifyCitizenRejection('AUTHORITY', complaintId);
    }

    return updated;
  }
}
