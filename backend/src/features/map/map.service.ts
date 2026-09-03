// src/features/map/map.service.ts
import { ComplaintStatus } from '@prisma/client';
import { prisma } from '../../core/database/prisma';
import { memoryCache } from '../../core/cache/memoryCache';

const MAP_CACHE_KEY = 'map:clusters:geojson';
const MAP_CACHE_TTL = 60; // 60 Seconds cache

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    clusterId: string;
    priorityScore: number;
    complaintCount: number;
    category: string;
    status: string;
    isNearSensitive: boolean;
  };
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export class MapService {
  /**
   * Generates a GeoJSON FeatureCollection of open complaint clusters for Leaflet/Mapbox rendering.
   * Cached in memory for 60 seconds.
   */
  public static async getMapGeoJSON(): Promise<GeoJSONFeatureCollection> {
    const cached = memoryCache.get<GeoJSONFeatureCollection>(MAP_CACHE_KEY);
    if (cached) {
      return cached;
    }

    const clusters = await prisma.complaintCluster.findMany({
      where: {
        status: { notIn: [ComplaintStatus.RESOLVED, ComplaintStatus.REJECTED] },
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
      },
    });

    const features: GeoJSONFeature[] = clusters.map((c) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [c.centroidLng, c.centroidLat],
      },
      properties: {
        clusterId: c.id,
        priorityScore: c.priorityScore,
        complaintCount: c.complaintCount,
        category: c.category,
        status: c.status,
        isNearSensitive: c.isNearSensitive,
      },
    }));

    const collection: GeoJSONFeatureCollection = {
      type: 'FeatureCollection',
      features,
    };

    memoryCache.set(MAP_CACHE_KEY, collection, MAP_CACHE_TTL);
    return collection;
  }
}
