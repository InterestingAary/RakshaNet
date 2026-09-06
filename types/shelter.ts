import type { LatLng } from './common';

export interface Shelter {
  id: string;
  name: string;
  address: string;
  location: LatLng;
  type: 'school' | 'community_hall' | 'stadium' | 'hospital' | 'other';
  status: 'active' | 'inactive' | 'full';
  totalCapacity: number;
  occupancy: number;
  reservedCapacity: number;
  accessibilityConstraints: number;
  effectiveAvailableCapacity: number;
  hasMedicalFacility: boolean;
  hasPowerBackup: boolean;
  hasWater: boolean;
  hasFood: boolean;
  contactPhone: string;
  managerId: string;
  activatedAt: Date | null;
  updatedAt: Date;
  facilities: string[];
  verified?: boolean;
  distance_meters?: number;
  distance_km?: number;
}

export interface ShelterCapacity {
  shelterId: string;
  totalCapacity: number;
  occupancy: number;
  reservedCapacity: number;
  accessibilityConstraints: number;
  effectiveAvailableCapacity: number;
  utilizationPercent: number;
  updatedAt: Date;
}

export interface ShelterRecommendationResponse {
  recommended_shelter: Shelter | null;
  distance_meters: number | null;
  distance_km: number | null;
  available_capacity: number | null;
  citizen_location: LatLng;
  available_shelters: Shelter[];
}
