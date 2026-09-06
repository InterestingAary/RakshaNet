import { apiClient } from '@/lib/apiClient';
import { HazardZone, GeoJSONMultiPolygon } from '@/types/disaster';
import { LatLng, Severity } from '@/types/common';
import { MOCK_HAZARD_ZONES } from '@/mock/disasterData';

export interface BackendHazardZoneResponse {
  id: string;
  disaster_id: string;
  name: string;
  severity: number;
  geometry: GeoJSONMultiPolygon;
  source: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string | null;
}

/**
 * Converts integer severity (1-5) from backend to frontend Severity string.
 */
export function mapSeverityNumberToString(severity: number | string): Severity {
  if (typeof severity === 'string') {
    const s = severity.toLowerCase();
    if (s === 'critical' || s === 'high' || s === 'medium' || s === 'low') {
      return s as Severity;
    }
  }
  const num = Number(severity);
  if (num >= 5) return 'critical';
  if (num >= 4) return 'high';
  if (num >= 3) return 'medium';
  return 'low';
}

/**
 * Extracts Leaflet LatLng points from GeoJSON MultiPolygon coordinates [lon, lat]
 */
export function extractPolygonLatLngs(geometry: GeoJSONMultiPolygon): LatLng[] {
  const points: LatLng[] = [];
  if (!geometry || !Array.isArray(geometry.coordinates)) return points;

  for (const polygon of geometry.coordinates) {
    if (!Array.isArray(polygon)) continue;
    for (const ring of polygon) {
      if (!Array.isArray(ring)) continue;
      for (const [lon, lat] of ring) {
        if (typeof lat === 'number' && typeof lon === 'number') {
          points.push({ lat, lng: lon });
        }
      }
    }
  }
  return points;
}

/**
 * Maps backend hazard zone response to frontend HazardZone model
 */
export function mapBackendHazardZone(item: BackendHazardZoneResponse): HazardZone {
  const severityStr = mapSeverityNumberToString(item.severity);
  const polygon = extractPolygonLatLngs(item.geometry);

  return {
    id: item.id,
    disaster_id: item.disaster_id,
    disasterEventId: item.disaster_id,
    name: item.name,
    severity: severityStr,
    geometry: item.geometry,
    polygon,
    type: 'flood',
    source: item.source ?? undefined,
    verified: item.verified,
    description: item.source ? `Source: ${item.source}` : 'Verified Hazard Zone',
    created_at: item.created_at,
    updated_at: item.updated_at ?? undefined,
    updatedAt: item.updated_at ? new Date(item.updated_at) : new Date(item.created_at),
  };
}

export const hazardService = {
  /**
   * Fetch verified hazard zones for citizen map view.
   * Falls back to demo mock data if demo mode is enabled or API fails in development.
   */
  async getVerifiedHazards(disasterEventId?: string): Promise<HazardZone[]> {
    try {
      const isMockId = disasterEventId === 'evt-001';
      const query = (disasterEventId && !isMockId) ? `?disaster_id=${encodeURIComponent(disasterEventId)}` : '';
      const response = await apiClient.get<BackendHazardZoneResponse[]>(`/api/v1/hazards${query}`);

      if (Array.isArray(response) && response.length > 0) {
        return response.map(mapBackendHazardZone);
      }

      // If backend returns empty array and demo mode is configured, return mock data
      if (Array.isArray(response) && response.length === 0) {
        const isDemo = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
        if (isDemo) {
          return MOCK_HAZARD_ZONES;
        }
        return [];
      }

      return [];
    } catch (err) {
      // In development or demo mode, if backend is offline/unreachable, gracefully fallback
      const isDemo = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
      if (isDemo) {
        return MOCK_HAZARD_ZONES;
      }
      throw err;
    }
  },
};
