import { PriorityCase } from '@/types';
import { MOCK_PRIORITY_CASES } from '@/mock/priorityData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let mockPriorityCases = [...MOCK_PRIORITY_CASES];

export const priorityService = {
  async getPriorityCases(): Promise<PriorityCase[]> {
    await delay(300);
    return [...mockPriorityCases];
  },

  async getPriorityCase(id: string): Promise<PriorityCase | null> {
    await delay(200);
    return mockPriorityCases.find(c => c.id === id) || null;
  },

  async updatePriorityCase(id: string, data: Partial<PriorityCase>): Promise<PriorityCase> {
    await delay(300);
    const caseIndex = mockPriorityCases.findIndex(c => c.id === id);
    if (caseIndex === -1) throw new Error('Priority case not found');
    
    const updated = { 
      ...mockPriorityCases[caseIndex], 
      ...data,
      updatedAt: new Date() 
    };
    mockPriorityCases[caseIndex] = updated;
    return updated;
  },

  async assignTeamToCase(caseId: string, teamId: string): Promise<PriorityCase> {
    await delay(300);
    const caseIndex = mockPriorityCases.findIndex(c => c.id === caseId);
    if (caseIndex === -1) throw new Error('Priority case not found');
    
    const updated = { 
      ...mockPriorityCases[caseIndex], 
      assignedTeamId: teamId,
      evacuationStatus: 'in_progress' as PriorityCase['evacuationStatus'],
      updatedAt: new Date() 
    };
    mockPriorityCases[caseIndex] = updated;
    return updated;
  }
};
