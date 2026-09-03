// src/features/clustering/clustering.service.ts
import { ComplaintCategory, ComplaintStatus } from '@prisma/client';
import { prisma } from '../../core/database/prisma';
import { AIService } from '../ai/ai.service';
import { PriorityService } from './priority.service';

const CLUSTER_RADIUS_METERS = 500;
const SIMILARITY_THRESHOLD = 0.75;

export interface ComplaintInputData {
  id: string;
  lat: number;
  lng: number;
  photoUrl: string;
  category: ComplaintCategory;
}

export class ClusteringService {
  /**
   * Implements ADR-007:
   * 1. Query PostGIS for open clusters within 500m of the same category.
   * 2. Compare photo with the seed photo of candidate clusters using Gemini Vision.
   * 3. Attach if similarity >= 0.75, else seed a new cluster.
   * 4. Recalculate priority score.
   */
  public static async clusterComplaint(complaint: ComplaintInputData): Promise<{
    clusterId: string;
    isSeed: boolean;
  }> {
    let candidateClusterIds: string[] = [];

    try {
      const nearby = await prisma.$queryRaw<Array<{ id: string; distance: number }>>`
        SELECT id,
               ST_Distance(
                 ST_MakePoint(${complaint.lng}, ${complaint.lat})::geography,
                 ST_MakePoint("centroidLng", "centroidLat")::geography
               ) AS distance
        FROM complaint_clusters
        WHERE status NOT IN ('RESOLVED', 'REJECTED')
          AND category = ${complaint.category}::"ComplaintCategory"
          AND ST_DWithin(
                ST_MakePoint(${complaint.lng}, ${complaint.lat})::geography,
                ST_MakePoint("centroidLng", "centroidLat")::geography,
                ${CLUSTER_RADIUS_METERS}
              )
        ORDER BY distance ASC
        LIMIT 5;
      `;

      if (nearby && nearby.length > 0) {
        candidateClusterIds = nearby.map((c) => c.id);
      }
    } catch (err) {
      // Fallback for non-PostGIS local SQLite or basic PG: approximate distance filtering
      const openClusters = await prisma.complaintCluster.findMany({
        where: {
          category: complaint.category,
          status: { notIn: [ComplaintStatus.RESOLVED, ComplaintStatus.REJECTED] },
        },
      });

      for (const c of openClusters) {
        const dLat = (c.centroidLat - complaint.lat) * 111000;
        const dLng =
          (c.centroidLng - complaint.lng) *
          111000 *
          Math.cos((complaint.lat * Math.PI) / 180);
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);
        if (dist <= CLUSTER_RADIUS_METERS) {
          candidateClusterIds.push(c.id);
        }
      }
    }

    // If no candidate clusters within 500m, create a new seed cluster
    if (candidateClusterIds.length === 0) {
      return this.createNewCluster(complaint);
    }

    // Check candidate clusters with AI image comparison
    for (const clusterId of candidateClusterIds) {
      const cluster = await prisma.complaintCluster.findUnique({
        where: { id: clusterId },
        include: {
          complaints: {
            where: { isSeed: true },
            take: 1,
          },
        },
      });

      const seedComplaint = cluster?.complaints[0];
      if (!seedComplaint?.photoUrl) continue;

      const { similarity } = await AIService.compareImages(
        seedComplaint.photoUrl,
        complaint.photoUrl
      );

      if (similarity >= SIMILARITY_THRESHOLD) {
        return this.attachToExistingCluster(complaint, clusterId);
      }
    }

    // No similar images matched the threshold
    return this.createNewCluster(complaint);
  }

  private static async createNewCluster(complaint: ComplaintInputData) {
    const cluster = await prisma.complaintCluster.create({
      data: {
        centroidLat: complaint.lat,
        centroidLng: complaint.lng,
        category: complaint.category,
        complaintCount: 1,
        status: ComplaintStatus.SUBMITTED,
      },
    });

    await PriorityService.recalculate(cluster.id);

    return { clusterId: cluster.id, isSeed: true };
  }

  private static async attachToExistingCluster(
    complaint: ComplaintInputData,
    clusterId: string
  ) {
    const cluster = await prisma.complaintCluster.findUnique({
      where: { id: clusterId },
      include: { complaints: true },
    });

    if (!cluster) {
      return this.createNewCluster(complaint);
    }

    const totalCount = cluster.complaintCount + 1;
    // Calculate new average centroid
    const newLat = (cluster.centroidLat * cluster.complaintCount + complaint.lat) / totalCount;
    const newLng = (cluster.centroidLng * cluster.complaintCount + complaint.lng) / totalCount;

    await prisma.complaintCluster.update({
      where: { id: clusterId },
      data: {
        complaintCount: totalCount,
        centroidLat: newLat,
        centroidLng: newLng,
      },
    });

    await PriorityService.recalculate(clusterId);

    return { clusterId, isSeed: false };
  }
}
