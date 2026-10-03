// frontend/src/features/map/services/mapService.ts
import { api } from '../../../core/api/client';
import type { ApiResponse, GeoJsonFeatureCollection, ComplaintCluster } from '../../../core/types';

export const mapService = {
  getGeoJsonFeed: async () => {
    const res = await api.get<ApiResponse<GeoJsonFeatureCollection>>('/map/complaints');
    return res.data;
  },

  getClusters: async () => {
    const res = await api.get<ApiResponse<ComplaintCluster[]>>('/clusters');
    return res.data;
  },

  getMapSummary: async () => {
    const res = await api.get<ApiResponse<any>>('/map/summary');
    return res.data;
  },
};
