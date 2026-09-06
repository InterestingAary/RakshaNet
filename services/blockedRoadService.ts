import { apiClient } from '@/lib/apiClient';
import { authService } from '@/services/authService';
import type {
  BlockedRoad,
  BlockedRoadReportInput,
  BlockedRoadAuditLog,
} from '@/types/blockedRoad';

export const MOCK_BLOCKED_ROADS: BlockedRoad[] = [
  {
    id: 'mock-block-001',
    disaster_id: 'evt-001',
    road_name: 'Eluru Road near Benz Circle',
    description: 'Eluru Road near Benz Circle Junction under 1.5 ft water.',
    blockage_type: 'FLOODED',
    severity: 'FULL_CLOSURE',
    status: 'VERIFIED',
    verified: true,
    latitude: 16.505,
    longitude: 80.642,
    reported_by_id: 'citizen-demo',
    verified_by_id: 'authority-demo',
    verified_at: '2026-08-26T14:10:00Z',
    cleared_at: null,
    created_at: '2026-08-26T14:00:00Z',
    updated_at: '2026-08-26T14:10:00Z',
  },
  {
    id: 'mock-block-002',
    disaster_id: 'evt-001',
    road_name: 'Bandar Road near Rajiv Gandhi Park',
    description: 'Fallen banyan tree blocking Bandar Road near Rajiv Gandhi Park.',
    blockage_type: 'TREE_FALL',
    severity: 'PARTIAL',
    status: 'VERIFIED',
    verified: true,
    latitude: 16.513,
    longitude: 80.627,
    reported_by_id: 'citizen-demo',
    verified_by_id: 'authority-demo',
    verified_at: '2026-08-26T14:15:00Z',
    cleared_at: null,
    created_at: '2026-08-26T14:05:00Z',
    updated_at: '2026-08-26T14:15:00Z',
  },
];

export const blockedRoadService = {
  /**
   * Fetch verified blocked roads for citizen map view.
   * Only returns verified=True and status=VERIFIED records.
   */
  async getVerifiedBlockedRoads(disasterId?: string): Promise<BlockedRoad[]> {
    try {
      const query = disasterId
        ? `?disaster_id=${encodeURIComponent(disasterId)}`
        : '';
      const response = await apiClient.get<BlockedRoad[]>(
        `/api/v1/blocked-roads${query}`
      );

      if (Array.isArray(response) && response.length > 0) {
        return response;
      }

      if (Array.isArray(response) && response.length === 0) {
        const isDemo =
          typeof process !== 'undefined' &&
          process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
        if (isDemo) {
          return MOCK_BLOCKED_ROADS;
        }
        return [];
      }

      return [];
    } catch (err) {
      const isDemo =
        typeof process !== 'undefined' &&
        process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
      if (isDemo) {
        return MOCK_BLOCKED_ROADS;
      }
      throw err;
    }
  },

  /**
   * Submit a citizen blocked-road report.
   * Default status is always REPORTED and verified is false.
   */
  async reportBlockedRoad(
    input: BlockedRoadReportInput
  ): Promise<BlockedRoad> {
    return apiClient.post<BlockedRoad>(
      '/api/v1/blocked-roads',
      {
        road_name: input.road_name,
        description: input.description,
        latitude: input.latitude,
        longitude: input.longitude,
        blockage_type: (input.blockage_type || 'OTHER').toUpperCase(),
        severity: (input.severity || 'FULL_CLOSURE').toUpperCase(),
        disaster_id: input.disaster_id ?? null,
      },
      {
        headers: authService.getAuthHeaders(),
      }
    );
  },

  /**
   * Get blocked road details by ID.
   */
  async getBlockedRoad(id: string): Promise<BlockedRoad> {
    return apiClient.get<BlockedRoad>(`/api/v1/blocked-roads/${id}`);
  },

  /**
   * Get audit log history for a blocked road.
   */
  async getAuditLogs(id: string): Promise<BlockedRoadAuditLog[]> {
    return apiClient.get<BlockedRoadAuditLog[]>(
      `/api/v1/blocked-roads/${id}/audit-logs`,
      {
        headers: authService.getAuthHeaders(),
      }
    );
  },

  /**
   * Verify a blocked road (Authority/Admin only).
   */
  async verifyBlockedRoad(
    id: string,
    notes?: string
  ): Promise<BlockedRoad> {
    return apiClient.patch<BlockedRoad>(
      `/api/v1/blocked-roads/${id}/verify`,
      { notes: notes ?? null },
      {
        headers: authService.getAuthHeaders(),
      }
    );
  },

  /**
   * Mark a blocked road as cleared (Authority/Admin only).
   */
  async clearBlockedRoad(
    id: string,
    notes?: string
  ): Promise<BlockedRoad> {
    return apiClient.patch<BlockedRoad>(
      `/api/v1/blocked-roads/${id}/clear`,
      { notes: notes ?? null },
      {
        headers: authService.getAuthHeaders(),
      }
    );
  },
};
