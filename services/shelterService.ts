import { apiClient } from '@/lib/apiClient';
import { authService } from '@/services/authService';
import type { Shelter, ShelterCapacity } from '@/types';

interface BackendShelter {
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
  created_by_id: string;
  created_at: string;
  updated_at: string;
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
  async getShelters(): Promise<Shelter[]> {
    const shelters = await apiClient.get<BackendShelter[]>('/api/v1/shelters', requestOptions());
    return shelters.map(mapShelter);
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
      updatedAt: shelter.updatedAt
    };
    return capacity;
  }
};
