import { ComplaintCategory, ComplaintStatus, VerificationMethod, RatnaEvent } from '@prisma/client';
import { prisma } from '../../core/database/prisma';
import {
  UpdateStatusInput,
  AssignComplaintInput,
  ResolveComplaintInput,
} from './authority.schema';
import { AIService } from '../ai/ai.service';
import { NotificationService } from '../admin/notification.service';
import { RatnaService } from '../ratna/ratna.service';

export class AuthorityService {
  public static async getStaff() {
    return prisma.user.findMany({
      where: {
        role: { in: ['AUTHORITY', 'ADMIN'] },
        isFlagged: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        jurisdiction: true,
        createdAt: true,
        updatedAt: true,
        isFlagged: true,
      },
    });
  }

  /**
   * Retrieves priority-sorted complaint queue for municipal authority officers.
   */
  public static async getQueue(filters: {
    category?: ComplaintCategory;
    status?: ComplaintStatus;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 25;
    const skip = (page - 1) * limit;

    const where = {
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    };

    const [total, complaints] = await Promise.all([
      prisma.complaint.count({ where }),
      prisma.complaint.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { cluster: { priorityScore: 'desc' } },
          { createdAt: 'asc' },
        ],
        include: {
          user: { select: { id: true, name: true, phone: true } },
          cluster: true,
          assignments: {
            include: {
              assignedTo: { select: { id: true, name: true } },
            },
          },
          resolution: true,
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

  public static async updateStatus(
    complaintId: string,
    authorityId: string,
    data: UpdateStatusInput
  ) {
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!complaint) {
      throw new Error('Complaint not found.');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const comp = await tx.complaint.update({
        where: { id: complaintId },
        data: { status: data.status },
      });

      await tx.statusHistory.create({
        data: {
          complaintId,
          oldStatus: complaint.status,
          newStatus: data.status,
          changedById: authorityId,
          notes: data.notes || `Status updated to ${data.status} by authority.`,
        },
      });

      return comp;
    });

    await NotificationService.notifyStatusChange(
      complaint.userId,
      complaintId,
      data.status
    );

    return updated;
  }

  public static async assignComplaint(
    complaintId: string,
    authorityId: string,
    data: AssignComplaintInput
  ) {
    const assignment = await prisma.$transaction(async (tx) => {
      const current = await tx.complaint.findUnique({
        where: { id: complaintId },
        select: { status: true },
      });

      if (!current) {
        throw new Error('Complaint not found.');
      }

      const assign = await tx.complaintAssignment.create({
        data: {
          complaintId,
          assignedToId: data.assignedToId,
          assignedById: authorityId,
          notes: data.notes,
        },
        include: {
          assignedTo: { select: { id: true, name: true } },
        },
      });

      await tx.complaint.update({
        where: { id: complaintId },
        data: { status: ComplaintStatus.ASSIGNED },
      });

      await tx.statusHistory.create({
        data: {
          complaintId,
          oldStatus: current.status,
          newStatus: ComplaintStatus.ASSIGNED,
          changedById: authorityId,
          notes: `Assigned to ${assign.assignedTo.name}.`,
        },
      });

      return assign;
    });

    return assignment;
  }

  /**
   * Authority uploads after-repair photo.
   * Runs AI image comparison (Gemini 2.0 Flash).
   * If AI verifies resolution (similarity >= 0.70): sets status to RESOLVED and prompts citizen confirmation.
   * Else: routes to UNDER_REVIEW and requests citizen confirmation.
   */
  public static async resolveComplaint(
    complaintId: string,
    authorityId: string,
    data: ResolveComplaintInput
  ) {
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!complaint) {
      throw new Error('Complaint not found.');
    }

    // 1. Run AI before/after image comparison
    const aiResult = await AIService.compareImages(
      complaint.photoUrl,
      data.afterPhotoUrl
    );

    const isAiResolved = aiResult.resolved && aiResult.similarity >= 0.7;
    const nextStatus = isAiResolved
      ? ComplaintStatus.RESOLVED
      : ComplaintStatus.UNDER_REVIEW;

    const verificationMethod = isAiResolved
      ? VerificationMethod.AI_COMPARISON
      : VerificationMethod.CITIZEN_CONFIRMATION;

    const result = await prisma.$transaction(async (tx) => {
      // Upsert resolution verification
      const verification = await tx.resolutionVerification.upsert({
        where: { complaintId },
        create: {
          complaintId,
          beforePhotoUrl: complaint.photoUrl,
          afterPhotoUrl: data.afterPhotoUrl,
          aiSimilarityScore: aiResult.similarity,
          verificationMethod,
          verifiedAt: isAiResolved ? new Date() : null,
        },
        update: {
          afterPhotoUrl: data.afterPhotoUrl,
          aiSimilarityScore: aiResult.similarity,
          verificationMethod,
          verifiedAt: isAiResolved ? new Date() : null,
        },
      });

      // Update complaint status
      const updatedComp = await tx.complaint.update({
        where: { id: complaintId },
        data: { status: nextStatus },
      });

      // Audit trail
      await tx.statusHistory.create({
        data: {
          complaintId,
          oldStatus: complaint.status,
          newStatus: nextStatus,
          changedById: authorityId,
          notes: `Resolution photo submitted. AI verification: similarity ${aiResult.similarity.toFixed(
            2
          )} (${aiResult.reasoning}). ${data.notes || ''}`,
        },
      });

      return { complaint: updatedComp, verification, aiResult };
    });

    // Notify citizen to confirm
    await NotificationService.notifyResolutionConfirmationRequest(
      complaint.userId,
      complaintId
    );

    if (isAiResolved) {
      await RatnaService.award(complaint.userId, RatnaEvent.COMPLAINT_RESOLVED, complaintId);
    }

    return result;
  }
}
