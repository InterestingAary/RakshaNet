import { apiClient } from '@/lib/apiClient';
import { authService } from '@/services/authService';
import { hazardService } from '@/services/hazardService';
import { DisasterEvent, HazardZone, TimelineEvent, PriorityCase, ResponseTeam } from '@/types';
import { MOCK_PRIORITY_CASES } from '@/mock/priorityData';
import { MOCK_RESPONSE_TEAMS } from '@/mock/responseTeamData';

interface BackendDisasterResponse {
  id: string | number;
  title: string;
  disaster_type: string;
  severity: DisasterEvent['severity'];
  description: string;
  status: string;
  latitude: number;
  longitude: number;
  location: string | null;
  created_by_id: string;
  created_at: string;
  updated_at: string;
}

function mapBackendDisaster(record: BackendDisasterResponse): DisasterEvent {
  const type = record.disaster_type.toLowerCase();
  const severity = record.severity.toLowerCase() as DisasterEvent['severity'];
  const status = record.status.toLowerCase();

  return {
    id: String(record.id),
    name: record.title,
    type: ['flood', 'cyclone', 'earthquake', 'fire'].includes(type)
      ? type as DisasterEvent['type']
      : 'other',
    severity,
    affectedArea: {
      north: record.latitude,
      south: record.latitude,
      east: record.longitude,
      west: record.longitude,
    },
    description: record.description,
    startTime: new Date(record.created_at),
    status: status === 'active' || status === 'monitoring' ? status : 'resolved',
    instructions: '',
    affectedPopulation: 0,
    createdBy: record.created_by_id,
    updatedAt: new Date(record.updated_at),
  };
}

export const disasterService = {
  async getActiveDisaster(): Promise<DisasterEvent | null> {
    const disasters = await this.getDisasters();
    return disasters.find((d) => d.status === 'active' || d.status === 'monitoring') ?? disasters[0] ?? null;
  },

  async getDisasters(): Promise<DisasterEvent[]> {
    const response = await apiClient.get<BackendDisasterResponse[]>('/api/v1/disasters', {
      headers: authService.getAuthHeaders(),
    });
    return response.map(mapBackendDisaster);
  },

  async createDisaster(data: Omit<DisasterEvent, 'id' | 'createdBy' | 'updatedAt'>): Promise<DisasterEvent> {
    const authHeaders = authService.getAuthHeaders();
    const payload = {
      title: data.name,
      description: data.description,
      disaster_type: data.type,
      severity: data.severity,
      latitude: data.affectedArea.north,
      longitude: data.affectedArea.east,
    };

    const created = await apiClient.post<BackendDisasterResponse>('/api/v1/disasters', payload, {
      headers: authHeaders,
    });
    return mapBackendDisaster(created);
  },

  async updateDisaster(id: string, data: Partial<DisasterEvent>): Promise<DisasterEvent> {
    const authHeaders = authService.getAuthHeaders();

    const updated = await apiClient.patch<BackendDisasterResponse>(`/api/v1/disasters/${id}`, {
      title: data.name,
      description: data.description,
      disaster_type: data.type,
      severity: data.severity,
      status: data.status,
      latitude: data.affectedArea?.north,
      longitude: data.affectedArea?.east,
    }, {
      headers: authHeaders,
    });
    return mapBackendDisaster(updated);
  },

  async getHazardZones(disasterEventId?: string): Promise<HazardZone[]> {
    return hazardService.getVerifiedHazards(disasterEventId);
  },

  async getTimeline(disasterEventId?: string): Promise<TimelineEvent[]> {
    try {
      if (!disasterEventId || disasterEventId === 'evt-001') {
        return [];
      }
      const events = await apiClient.get<TimelineEvent[]>(`/api/v1/disasters/${disasterEventId}/timeline`, {
        headers: authService.getAuthHeaders(),
      });
      return Array.isArray(events) ? events : [];
    } catch {
      return [];
    }
  },

  async getPriorityCases(): Promise<PriorityCase[]> {
    return [...MOCK_PRIORITY_CASES];
  },

  async getResponseTeams(): Promise<ResponseTeam[]> {
    return [...MOCK_RESPONSE_TEAMS];
  }
};
