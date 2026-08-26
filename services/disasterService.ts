import { DisasterEvent, HazardZone, TimelineEvent, PriorityCase, ResponseTeam } from '@/types';
import { MOCK_DISASTER_EVENT, MOCK_HAZARD_ZONES, MOCK_TIMELINE_EVENTS } from '@/mock/disasterData';
import { MOCK_PRIORITY_CASES } from '@/mock/priorityData';
import { MOCK_RESPONSE_TEAMS } from '@/mock/responseTeamData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const disasterService = {
  async getActiveDisaster(): Promise<DisasterEvent | null> {
    await delay(300);
    return MOCK_DISASTER_EVENT.status === 'active' ? MOCK_DISASTER_EVENT : null;
  },

  async getDisasters(): Promise<DisasterEvent[]> {
    await delay(300);
    return [MOCK_DISASTER_EVENT];
  },

  async createDisaster(data: Omit<DisasterEvent, 'id' | 'createdBy' | 'updatedAt'>): Promise<DisasterEvent> {
    await delay(400);
    const newDisaster: DisasterEvent = {
      ...data,
      id: `disaster-${Date.now()}`,
      createdBy: 'auth-1',
      updatedAt: new Date()
    } as DisasterEvent;
    return newDisaster;
  },

  async updateDisaster(id: string, data: Partial<DisasterEvent>): Promise<DisasterEvent> {
    await delay(400);
    if (id !== MOCK_DISASTER_EVENT.id) throw new Error('Disaster not found');
    return { ...MOCK_DISASTER_EVENT, ...data, updatedAt: new Date() };
  },

  async getHazardZones(disasterEventId: string): Promise<HazardZone[]> {
    await delay(300);
    return MOCK_HAZARD_ZONES.filter(hz => hz.disasterEventId === disasterEventId);
  },

  async getTimeline(disasterEventId: string): Promise<TimelineEvent[]> {
    await delay(300);
    return MOCK_TIMELINE_EVENTS.filter(te => te.relatedEntityId === disasterEventId);
  },

  async getPriorityCases(): Promise<PriorityCase[]> {
    await delay(300);
    return [...MOCK_PRIORITY_CASES];
  },

  async getResponseTeams(): Promise<ResponseTeam[]> {
    await delay(300);
    return [...MOCK_RESPONSE_TEAMS];
  }
};
