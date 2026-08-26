import { IncidentReport, NeedHelpRequest } from '@/types';
import { MOCK_INCIDENTS } from '@/mock/incidentData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let mockIncidents = [...MOCK_INCIDENTS];

export const incidentService = {
  async getIncidents(): Promise<IncidentReport[]> {
    await delay(300);
    return [...mockIncidents];
  },

  async getIncident(id: string): Promise<IncidentReport | null> {
    await delay(200);
    return mockIncidents.find(inc => inc.id === id) || null;
  },

  async submitIncident(data: Omit<IncidentReport, 'id' | 'reportedAt' | 'updatedAt' | 'status'>): Promise<IncidentReport> {
    await delay(400);
    const newIncident: IncidentReport = {
      ...data,
      id: `inc-${Date.now()}`,
      status: 'new',
      reportedAt: new Date(),
      updatedAt: new Date()
    } as IncidentReport;
    
    mockIncidents = [newIncident, ...mockIncidents];
    return newIncident;
  },

  async updateIncidentStatus(id: string, status: IncidentReport['status']): Promise<IncidentReport> {
    await delay(300);
    const incidentIndex = mockIncidents.findIndex(inc => inc.id === id);
    if (incidentIndex === -1) throw new Error('Incident not found');
    
    const updated = { 
      ...mockIncidents[incidentIndex], 
      status, 
      updatedAt: new Date() 
    };
    mockIncidents[incidentIndex] = updated;
    return updated;
  },

  async assignTeam(incidentId: string, teamId: string): Promise<IncidentReport> {
    await delay(300);
    const incidentIndex = mockIncidents.findIndex(inc => inc.id === incidentId);
    if (incidentIndex === -1) throw new Error('Incident not found');
    
    const updated = { 
      ...mockIncidents[incidentIndex], 
      assignedTeamId: teamId,
      status: 'assigned' as IncidentReport['status'],
      updatedAt: new Date() 
    };
    mockIncidents[incidentIndex] = updated;
    return updated;
  },

  async submitNeedHelp(data: Omit<NeedHelpRequest, 'id' | 'submittedAt' | 'status' | 'reportId'>): Promise<NeedHelpRequest> {
    await delay(400);
    const newRequest: NeedHelpRequest = {
      ...data,
      id: `help-${Date.now()}`,
      status: 'submitted',
      submittedAt: new Date()
    } as NeedHelpRequest;
    return newRequest;
  }
};
