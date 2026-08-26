import { Shelter, ShelterCapacity } from '@/types';
import { MOCK_SHELTERS } from '@/mock/shelterData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let mockShelters = [...MOCK_SHELTERS];

export const shelterService = {
  async getShelters(): Promise<Shelter[]> {
    await delay(300);
    return [...mockShelters];
  },

  async getShelter(id: string): Promise<Shelter | null> {
    await delay(200);
    return mockShelters.find(s => s.id === id) || null;
  },

  async createShelter(data: Omit<Shelter, 'id' | 'updatedAt'>): Promise<Shelter> {
    await delay(400);
    const newShelter: Shelter = {
      ...data,
      id: `shelter-${Date.now()}`,
      updatedAt: new Date()
    } as Shelter;
    mockShelters.push(newShelter);
    return newShelter;
  },

  async updateShelter(id: string, data: Partial<Shelter>): Promise<Shelter> {
    await delay(300);
    const index = mockShelters.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Shelter not found');
    
    const updated = { ...mockShelters[index], ...data, updatedAt: new Date() };
    mockShelters[index] = updated;
    return updated;
  },

  async activateShelter(id: string): Promise<Shelter> {
    await delay(300);
    const index = mockShelters.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Shelter not found');
    
    const updated = { 
      ...mockShelters[index], 
      status: 'active' as Shelter['status'],
      activatedAt: new Date(),
      updatedAt: new Date()
    };
    mockShelters[index] = updated;
    return updated;
  },

  async deactivateShelter(id: string): Promise<Shelter> {
    await delay(300);
    const index = mockShelters.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Shelter not found');
    
    const updated = { 
      ...mockShelters[index], 
      status: 'inactive' as Shelter['status'],
      updatedAt: new Date()
    };
    mockShelters[index] = updated;
    return updated;
  },

  async getShelterCapacity(id: string): Promise<ShelterCapacity> {
    await delay(200);
    const shelter = mockShelters.find(s => s.id === id);
    if (!shelter) throw new Error('Shelter not found');
    
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
