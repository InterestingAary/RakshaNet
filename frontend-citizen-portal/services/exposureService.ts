import { apiClient } from '@/lib/apiClient';
import type { ExposureResponse } from '@/types/exposure';
import type { LatLng } from '@/types/common';

export interface BackendExposureResponse {
  is_exposed: boolean;
  citizen_location: {
    latitude: number;
    longitude: number;
  };
  hazard_zones: Array<{
    id: string;
    disaster_id: string;
    name: string;
    severity: number;
    source?: string | null;
    distance_meters: number;
  }>;
  highest_severity: number | null;
  nearest_hazard_distance_meters: number | null;
  message: string;
}

function mapExposureResponse(raw: BackendExposureResponse): ExposureResponse {
  return {
    is_exposed: raw.is_exposed,
    citizen_location: {
      lat: raw.citizen_location.latitude,
      lng: raw.citizen_location.longitude,
    },
    hazard_zones: raw.hazard_zones.map((hz) => ({
      id: hz.id,
      disaster_id: hz.disaster_id,
      name: hz.name,
      severity: hz.severity,
      source: hz.source,
      distance_meters: hz.distance_meters,
    })),
    highest_severity: raw.highest_severity,
    nearest_hazard_distance_meters: raw.nearest_hazard_distance_meters,
    message: raw.message,
  };
}

export const exposureService = {
  /**
   * Evaluates citizen spatial exposure against verified hazard zones using PostGIS ST_Intersects.
   */
  async checkExposure(coords: LatLng): Promise<ExposureResponse> {
    try {
      const response = await apiClient.get<BackendExposureResponse>(
        `/api/v1/hazards/exposure?latitude=${coords.lat}&longitude=${coords.lng}`
      );
      return mapExposureResponse(response);
    } catch (err) {
      const isDemo = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
      if (isDemo) {
        // Safe fallback in offline / demo mode
        return {
          is_exposed: false,
          citizen_location: coords,
          hazard_zones: [],
          highest_severity: null,
          nearest_hazard_distance_meters: 1500,
          message: 'Demo mode: You are outside simulated hazard zones.',
        };
      }
      throw err;
    }
  },
};
