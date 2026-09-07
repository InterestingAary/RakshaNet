import { apiClient } from '@/lib/apiClient';
import { authService } from '@/services/authService';
import type { EvacuationRoute, LatLng } from '@/types';
import { blockedRoadService } from './blockedRoadService';
import type { BlockedRoad, BlockageType, BlockageSeverity } from '@/types/blockedRoad';

interface RelocationRecommendation {
  shelter_id: string;
  shelter_name: string;
  distance_km: number;
  available_capacity: number;
  latitude: number;
  longitude: number;
  created_at?: string | null;
}

interface ReplanningRecommendation extends RelocationRecommendation {
  risk_flags: string[];
  risk_score: number;
  recommendation_reason: string;
  disaster_id: string | null;
}

function mapRecommendation(
  recommendation: RelocationRecommendation | ReplanningRecommendation,
  from: LatLng,
): EvacuationRoute {
  const isReplanning = 'risk_flags' in recommendation;
  const riskFlags = isReplanning ? recommendation.risk_flags : [];
  const riskScore = isReplanning ? recommendation.risk_score : 0;

  return {
    id: `relocation-${recommendation.shelter_id}`,
    fromLocation: from,
    toShelterId: recommendation.shelter_id,
    toShelterName: recommendation.shelter_name,
    waypoints: [],
    status: riskScore > 0 ? 'caution' : 'safe',
    distanceKm: recommendation.distance_km,
    warnings: [],
    alternativeAvailable: false,
    calculatedAt: recommendation.created_at ? new Date(recommendation.created_at) : new Date(),
    availableCapacity: recommendation.available_capacity,
    riskFlags,
    riskScore,
    recommendationReason: isReplanning ? recommendation.recommendation_reason : null,
    disasterId: isReplanning ? recommendation.disaster_id : null,
    toLocation: { lat: recommendation.latitude, lng: recommendation.longitude },
  };
}

const requestOptions = () => ({ headers: authService.getAuthHeaders() });

function buildRequest(from: LatLng, disasterId?: string) {
  return {
    latitude: from.lat,
    longitude: from.lng,
    ...(disasterId ? { disaster_id: disasterId } : {}),
  };
}

export const routingService = {
  async getSafeRoute(from: LatLng, _toShelterId: string, disasterId?: string): Promise<EvacuationRoute> {
    const recommendation = await apiClient.post<RelocationRecommendation>(
      '/api/v1/relocation/recommend', buildRequest(from, disasterId), requestOptions());
    return mapRecommendation(recommendation, from);
  },

  async getAlternativeRoute(from: LatLng, toShelterId: string, disasterId?: string): Promise<EvacuationRoute> {
    return this.getSafeRoute(from, toShelterId, disasterId);
  },

  async reportRouteBlocked(params: {
    from: LatLng;
    disasterId?: string;
    roadName?: string;
    description?: string;
    blockageType?: BlockageType;
    severity?: BlockageSeverity;
  }): Promise<BlockedRoad> {
    const isMock = params.disasterId === 'evt-001';
    const validDisasterId = params.disasterId && !isMock ? params.disasterId : undefined;
    return blockedRoadService.reportBlockedRoad({
      road_name: params.roadName || 'Reported Evacuation Obstacle',
      disaster_id: validDisasterId,
      latitude: params.from.lat,
      longitude: params.from.lng,
      blockage_type: params.blockageType || 'OTHER',
      severity: params.severity || 'FULL_CLOSURE',
      description: params.description || 'Blocked road reported along evacuation path',
    });
  },

  async getEvacuationRoute(from: LatLng, _toShelterId: string, signal?: AbortSignal, disasterId?: string): Promise<EvacuationRoute> {
    const recommendation = await apiClient.post<RelocationRecommendation>(
      '/api/v1/relocation/recommend', buildRequest(from, disasterId), { ...requestOptions(), signal });
    return mapRecommendation(recommendation, from);
  },

  async refreshEvacuationRoute(from: LatLng, _toShelterId: string, signal?: AbortSignal, disasterId?: string): Promise<EvacuationRoute> {
    const recommendation = await apiClient.post<ReplanningRecommendation>(
      '/api/v1/relocation/refresh', buildRequest(from, disasterId), { ...requestOptions(), signal });
    return mapRecommendation(recommendation, from);
  },
};
