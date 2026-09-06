import { apiClient } from '@/lib/apiClient';
import { authService } from '@/services/authService';
import type { IncidentReport, NeedHelpRequest } from '@/types';

interface BackendReport {
  id: string;
  title: string;
  description: string;
  report_type: 'SAFETY' | 'INFRASTRUCTURE' | 'WATER' | 'MEDICAL' | 'UTILITY' | 'ENVIRONMENT' | 'OTHER';
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
  latitude: number | null;
  longitude: number | null;
  location: string | null;
  created_by_id: string;
  created_at: string;
  updated_at: string;
}

const REPORT_TYPE_TO_INCIDENT_TYPE: Record<BackendReport['report_type'], IncidentReport['type']> = {
  SAFETY: 'other',
  INFRASTRUCTURE: 'road_blocked',
  WATER: 'flooded_route',
  MEDICAL: 'medical_emergency',
  UTILITY: 'other',
  ENVIRONMENT: 'other',
  OTHER: 'other',
};

const REPORT_STATUS_TO_INCIDENT_STATUS: Record<BackendReport['status'], IncidentReport['status']> = {
  OPEN: 'new',
  UNDER_REVIEW: 'reviewing',
  RESOLVED: 'resolved',
  REJECTED: 'resolved',
};

function mapReport(report: BackendReport): IncidentReport {
  return {
    id: report.id,
    type: REPORT_TYPE_TO_INCIDENT_TYPE[report.report_type],
    location:
      report.latitude !== null && report.longitude !== null
        ? { lat: report.latitude, lng: report.longitude }
        : null,
    address: report.location ?? '',
    description: report.description,
    imageUrl: null,
    videoUrl: null,
    reportedBy: 'citizen',
    reporterName: null,
    status: REPORT_STATUS_TO_INCIDENT_STATUS[report.status],
    severity: null,
    assignedTeamId: null,
    affectsRouteId: null,
    reportedAt: new Date(report.created_at),
    updatedAt: new Date(report.updated_at),
  };
}

function mapIncidentPayload(data: Omit<IncidentReport, 'id' | 'reportedAt' | 'updatedAt' | 'status'>) {
  const incidentType = String(data.type).toLowerCase();
  const reportType = incidentType.includes('medical')
    ? 'MEDICAL'
    : incidentType.includes('flood')
      ? 'WATER'
      : incidentType.includes('road') || incidentType.includes('tree') || incidentType.includes('damage')
        ? 'INFRASTRUCTURE'
        : 'OTHER';

  return {
    title: String(data.type).slice(0, 200),
    description: data.description,
    report_type: reportType,
    latitude: data.location?.lat ?? null,
    longitude: data.location?.lng ?? null,
    location: data.address || null,
  };
}

const requestOptions = () => ({ headers: authService.getAuthHeaders() });

export const incidentService = {
  async getIncidents(): Promise<IncidentReport[]> {
    const reports = await apiClient.get<BackendReport[]>('/api/v1/reports', requestOptions());
    return reports.map(mapReport);
  },

  async getIncident(id: string): Promise<IncidentReport> {
    const report = await apiClient.get<BackendReport>(`/api/v1/reports/${id}`, requestOptions());
    return mapReport(report);
  },

  async submitIncident(data: Omit<IncidentReport, 'id' | 'reportedAt' | 'updatedAt' | 'status'>): Promise<IncidentReport> {
    const report = await apiClient.post<BackendReport>(
      '/api/v1/reports',
      mapIncidentPayload(data),
      requestOptions(),
    );
    return mapReport(report);
  },

  async updateIncidentStatus(id: string, status: IncidentReport['status']): Promise<IncidentReport> {
    const backendStatus = status === 'reviewing' ? 'UNDER_REVIEW' : status === 'resolved' ? 'RESOLVED' : 'OPEN';
    const report = await apiClient.patch<BackendReport>(
      `/api/v1/reports/${id}`,
      { status: backendStatus },
      requestOptions(),
    );
    return mapReport(report);
  },

  async assignTeam(incidentId: string, teamId: string): Promise<IncidentReport> {
    throw new Error(`Report team assignment is not supported by the backend (team ${teamId}, report ${incidentId})`);
  },

  async submitNeedHelp(data: Omit<NeedHelpRequest, 'id' | 'submittedAt' | 'status' | 'reportId'>): Promise<NeedHelpRequest> {
    throw new Error(`Emergency help requests are not supported by the report API (${data.category})`);
  }
};
