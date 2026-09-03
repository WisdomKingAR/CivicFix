// backend/src/features/map/map.service.ts
import { ComplaintStatus } from '@prisma/client';
import { prisma } from '../../core/database/prisma';
import { memoryCache } from '../../core/cache/memoryCache';

const MAP_CACHE_KEY = 'map:geojson:v2';
const MAP_CACHE_TTL = 30; // 30 seconds — lower so new complaints appear faster

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    id: string;
    isCluster: boolean;
    priorityScore: number;
    complaintCount: number;
    category: string;
    status: string;
    isNearSensitive: boolean;
    description: string;
    photoUrl: string;
    address: string | null;
  };
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export class MapService {
  /**
   * Generates a GeoJSON FeatureCollection containing both clusters and solo (unclustered)
   * complaints with complete metadata properties for interactive inspection.
   */
  public static async getMapGeoJSON(): Promise<GeoJSONFeatureCollection> {
    const cached = memoryCache.get<GeoJSONFeatureCollection>(MAP_CACHE_KEY);
    if (cached) {
      return cached;
    }

    const EXCLUDED = [ComplaintStatus.RESOLVED, ComplaintStatus.REJECTED];

    // 1. Clustered complaints (use cluster centroid as location)
    const clusters = await prisma.complaintCluster.findMany({
      where: {
        status: { notIn: EXCLUDED },
      },
      select: {
        id: true,
        centroidLat: true,
        centroidLng: true,
        priorityScore: true,
        complaintCount: true,
        category: true,
        status: true,
        isNearSensitive: true,
        complaints: {
          take: 1,
          orderBy: { createdAt: 'asc' },
          select: {
            description: true,
            photoUrl: true,
            address: true,
          },
        },
      },
    });

    const clusterFeatures: GeoJSONFeature[] = clusters.map((c) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [c.centroidLng, c.centroidLat],
      },
      properties: {
        id: c.id,
        isCluster: true,
        priorityScore: c.priorityScore,
        complaintCount: c.complaintCount,
        category: c.category,
        status: c.status,
        isNearSensitive: c.isNearSensitive,
        description: c.complaints[0]?.description ?? 'Civic issue reported by citizens.',
        photoUrl: c.complaints[0]?.photoUrl ?? '',
        address: c.complaints[0]?.address ?? null,
      },
    }));

    // 2. Individual complaints NOT yet assigned to any cluster
    const soloComplaints = await prisma.complaint.findMany({
      where: {
        clusterId: null,
        status: { notIn: EXCLUDED },
      },
      select: {
        id: true,
        lat: true,
        lng: true,
        description: true,
        photoUrl: true,
        address: true,
        category: true,
        status: true,
      },
    });

    const soloFeatures: GeoJSONFeature[] = soloComplaints.map((c) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [c.lng, c.lat],
      },
      properties: {
        id: c.id,
        isCluster: false,
        priorityScore: 0,
        complaintCount: 1,
        category: c.category,
        status: c.status,
        isNearSensitive: false,
        description: c.description,
        photoUrl: c.photoUrl,
        address: c.address,
      },
    }));

    const collection: GeoJSONFeatureCollection = {
      type: 'FeatureCollection',
      features: [...clusterFeatures, ...soloFeatures],
    };

    memoryCache.set(MAP_CACHE_KEY, collection, MAP_CACHE_TTL);
    return collection;
  }
}
