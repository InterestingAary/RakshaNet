import { ResponseTeam } from '@/types';
import { MOCK_RESPONSE_TEAMS } from '@/mock/responseTeamData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let mockTeams = [...MOCK_RESPONSE_TEAMS];

export const responseTeamService = {
  async getResponseTeams(): Promise<ResponseTeam[]> {
    await delay(300);
    return [...mockTeams];
  },

  async getResponseTeam(id: string): Promise<ResponseTeam | null> {
    await delay(200);
    return mockTeams.find(t => t.id === id) || null;
  },

  async updateTeamStatus(id: string, status: ResponseTeam['status']): Promise<ResponseTeam> {
    await delay(300);
    const teamIndex = mockTeams.findIndex(t => t.id === id);
    if (teamIndex === -1) throw new Error('Team not found');
    
    const updated = { 
      ...mockTeams[teamIndex], 
      status,
      updatedAt: new Date()
    };
    mockTeams[teamIndex] = updated;
    return updated;
  },

  async assignToIncident(teamId: string, incidentId: string): Promise<ResponseTeam> {
    await delay(300);
    const teamIndex = mockTeams.findIndex(t => t.id === teamId);
    if (teamIndex === -1) throw new Error('Team not found');
    
    const updated = { 
      ...mockTeams[teamIndex], 
      assignedIncidentId: incidentId,
      status: 'assigned' as ResponseTeam['status'],
      updatedAt: new Date()
    };
    mockTeams[teamIndex] = updated;
    return updated;
  },

  async assignToPriorityCase(teamId: string, caseId: string): Promise<ResponseTeam> {
    await delay(300);
    const teamIndex = mockTeams.findIndex(t => t.id === teamId);
    if (teamIndex === -1) throw new Error('Team not found');
    
    const updated = { 
      ...mockTeams[teamIndex], 
      assignedPriorityCaseId: caseId,
      status: 'assigned' as ResponseTeam['status'],
      updatedAt: new Date()
    };
    mockTeams[teamIndex] = updated;
    return updated;
  }
};
