import { apiClient } from '@/lib/apiClient';
import { authService } from '@/services/authService';
import { MOCK_SHELTERS } from '@/mock/shelterData';
import type {
  Shelter,
  ShelterCapacity,
  ShelterRecommendationResponse,
  LatLng,
} from '@/types';

export interface BackendShelter {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  location: string | null;
  total_capacity: number;
  current_occupancy: number;
  available_capacity: number;
  status: 'ACTIVE' | 'INACTIVE';
  verified: boolean;
  distance_meters?: number;
  distance_km?: number;
  created_by_id: string;
  created_at: string;
  updated_at: string;
}

export interface BackendShelterRecommendationResponse {
  recommended_shelter: BackendShelter | null;
  distance_meters: number | null;
  distance_km: number | null;
  available_capacity: number | null;
  citizen_location: {
    latitude: number;
    longitude: number;
  };
  available_shelters: BackendShelter[];
}

function mapShelter(shelter: BackendShelter): Shelter {
  return {
    id: shelter.id,
    name: shelter.name,
    address: shelter.location ?? shelter.description,
    location: { lat: shelter.latitude, lng: shelter.longitude },
    type: 'other',
    status: shelter.status.toLowerCase() as Shelter['status'],
    totalCapacity: shelter.total_capacity,
    occupancy: shelter.current_occupancy,
    reservedCapacity: 0,
    accessibilityConstraints: 0,
    effectiveAvailableCapacity: shelter.available_capacity,
    hasMedicalFacility: false,
    hasPowerBackup: false,
    hasWater: false,
    hasFood: false,
    contactPhone: '',
    managerId: shelter.created_by_id,
    activatedAt: null,
    updatedAt: new Date(shelter.updated_at),
    facilities: [],
    verified: shelter.verified ?? true,
    distance_meters: shelter.distance_meters,
    distance_km: shelter.distance_km,
  };
}

function mapCreatePayload(data: Omit<Shelter, 'id' | 'updatedAt'>) {
  return {
    name: data.name,
    description: data.address,
    latitude: data.location.lat,
    longitude: data.location.lng,
    location: data.address,
    total_capacity: data.totalCapacity,
    current_occupancy: data.occupancy,
  };
}

function mapUpdatePayload(data: Partial<Shelter>) {
  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.address !== undefined) {
    payload.description = data.address;
    payload.location = data.address;
  }
  if (data.location !== undefined) {
    payload.latitude = data.location.lat;
    payload.longitude = data.location.lng;
  }
  if (data.totalCapacity !== undefined) payload.total_capacity = data.totalCapacity;
  if (data.occupancy !== undefined) payload.current_occupancy = data.occupancy;
  if (data.status === 'active' || data.status === 'inactive') {
    payload.status = data.status.toUpperCase();
  }
  return payload;
}

const requestOptions = () => ({ headers: authService.getAuthHeaders() });

export const shelterService = {
  /**
   * Public list of verified and active shelters.
   */
  async getShelters(): Promise<Shelter[]> {
    try {
      const shelters = await apiClient.get<BackendShelter[]>('/api/v1/shelters');
      if (Array.isArray(shelters) && shelters.length > 0) {
        return shelters.map(mapShelter);
      }
      const isDemo = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
      if (isDemo) {
        return MOCK_SHELTERS;
      }
      return [];
    } catch (err) {
      const isDemo = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
      if (isDemo) {
        return MOCK_SHELTERS;
      }
      throw err;
    }
  },

  /**
   * Recommend nearest verified available shelter using PostGIS spatial ST_Distance.
   */
  async recommendShelter(coords: LatLng, limit = 5): Promise<ShelterRecommendationResponse> {
    try {
      const resp = await apiClient.get<BackendShelterRecommendationResponse>(
        `/api/v1/shelters/recommend?latitude=${coords.lat}&longitude=${coords.lng}&limit=${limit}`
      );
      return {
        recommended_shelter: resp.recommended_shelter ? mapShelter(resp.recommended_shelter) : null,
        distance_meters: resp.distance_meters,
        distance_km: resp.distance_km,
        available_capacity: resp.available_capacity,
        citizen_location: coords,
        available_shelters: resp.available_shelters.map(mapShelter),
      };
    } catch (err) {
      const isDemo = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
      if (isDemo) {
        // Fallback for demo mode
        const available = MOCK_SHELTERS.filter(
          (s) => s.status === 'active' && s.occupancy < s.totalCapacity
        );
        const first = available[0] || null;
        return {
          recommended_shelter: first,
          distance_meters: 850,
          distance_km: 0.85,
          available_capacity: first ? first.totalCapacity - first.occupancy : null,
          citizen_location: coords,
          available_shelters: available,
        };
      }
      throw err;
    }
  },

  async getShelter(id: string): Promise<Shelter> {
    const shelter = await apiClient.get<BackendShelter>(`/api/v1/shelters/${id}`, requestOptions());
    return mapShelter(shelter);
  },

  async createShelter(data: Omit<Shelter, 'id' | 'updatedAt'>): Promise<Shelter> {
    const shelter = await apiClient.post<BackendShelter>(
      '/api/v1/shelters',
      mapCreatePayload(data),
      requestOptions(),
    );
    return mapShelter(shelter);
  },

  async updateShelter(id: string, data: Partial<Shelter>): Promise<Shelter> {
    const shelter = await apiClient.patch<BackendShelter>(
      `/api/v1/shelters/${id}`,
      mapUpdatePayload(data),
      requestOptions(),
    );
    return mapShelter(shelter);
  },

  async verifyShelter(id: string, verified: boolean): Promise<Shelter> {
    const shelter = await apiClient.patch<BackendShelter>(
      `/api/v1/shelters/${id}/verify`,
      { verified },
      requestOptions(),
    );
    return mapShelter(shelter);
  },

  async deleteShelter(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/shelters/${id}`, requestOptions());
  },

  async activateShelter(id: string): Promise<Shelter> {
    return this.updateShelter(id, { status: 'active' });
  },

  async deactivateShelter(id: string): Promise<Shelter> {
    return this.updateShelter(id, { status: 'inactive' });
  },

  async getShelterCapacity(id: string): Promise<ShelterCapacity> {
    const shelter = await this.getShelter(id);
    const capacity: ShelterCapacity = {
      shelterId: shelter.id,
      totalCapacity: shelter.totalCapacity,
      occupancy: shelter.occupancy,
      reservedCapacity: shelter.reservedCapacity,
      accessibilityConstraints: shelter.accessibilityConstraints,
      effectiveAvailableCapacity: shelter.effectiveAvailableCapacity,
      utilizationPercent: (shelter.occupancy / shelter.totalCapacity) * 100,
      updatedAt: shelter.updatedAt,
    };
    return capacity;
  },
};
