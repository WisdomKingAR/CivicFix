// src/features/clustering/clustering.controller.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/database/prisma';
import { sendSuccess, sendError } from '../../core/utils/response';

export class ClusteringController {
  public static async listClusters(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, status } = req.query;

      const clusters = await prisma.complaintCluster.findMany({
        where: {
          ...(category ? { category: category as any } : {}),
          ...(status ? { status: status as any } : {}),
        },
        orderBy: { priorityScore: 'desc' },
        include: {
          _count: { select: { complaints: true } },
        },
      });

      sendSuccess(res, clusters);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve clusters';
      sendError(res, msg, 500, 'CLUSTERS_FETCH_FAILED');
    }
  }

  public static async getClusterById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const cluster = await prisma.complaintCluster.findUnique({
        where: { id },
        include: {
          complaints: {
            include: {
              user: { select: { id: true, name: true, email: true } },
              resolution: true,
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!cluster) {
        sendError(res, 'Complaint cluster not found.', 404, 'NOT_FOUND');
        return;
      }

      sendSuccess(res, cluster);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch cluster details';
      sendError(res, msg, 500, 'CLUSTER_FETCH_FAILED');
    }
  }
}
