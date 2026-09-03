// src/features/map/map.controller.ts
import { Request, Response, NextFunction } from 'express';
import { MapService } from './map.service';
import { sendSuccess, sendError } from '../../core/utils/response';

export class MapController {
  public static async getMapData(req: Request, res: Response, next: NextFunction) {
    try {
      const geojson = await MapService.getMapGeoJSON();
      // GeoJSON responses can be directly rendered or wrapped in standard API envelope
      sendSuccess(res, geojson, 'Map clusters GeoJSON retrieved.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve map clusters';
      sendError(res, msg, 500, 'MAP_DATA_ERROR');
    }
  }
}
