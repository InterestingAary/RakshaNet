import type { LatLng } from './common';

export interface ExposureHazardZone {
  id: string;
  disaster_id: string;
  name: string;
  severity: number;
  source?: string | null;
  distance_meters: number;
}

export interface ExposureResponse {
  is_exposed: boolean;
  citizen_location: LatLng;
  hazard_zones: ExposureHazardZone[];
  highest_severity: number | null;
  nearest_hazard_distance_meters: number | null;
  message: string;
}
