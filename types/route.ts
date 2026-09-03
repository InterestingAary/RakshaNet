import type { Severity, LatLng } from './common';

export interface RouteWarning {
  id: string;
  routeId: string;
  location: LatLng;
  type: 'flood' | 'blocked_road' | 'bridge_damage' | 'other';
  description: string;
  severity: Severity;
}

export interface EvacuationRoute {
  id: string;
  fromLocation: LatLng;
  toShelterId: string;
  toShelterName: string;
  waypoints: LatLng[];
  status: 'safe' | 'caution' | 'blocked' | 'recalculating';
  distanceKm: number;
  estimatedTimeMin?: number;
  warnings: RouteWarning[];
  alternativeAvailable: boolean;
  calculatedAt: Date;
  availableCapacity?: number;
  riskFlags?: string[];
  riskScore?: number;
  recommendationReason?: string | null;
  disasterId?: string | null;
  toLocation?: LatLng;
}
