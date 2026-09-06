import { Alert } from '@/types';
import { MOCK_ALERTS } from '@/mock/disasterData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const alertService = {
  async getAlerts(disasterId?: string): Promise<Alert[]> {
    const isMockId = disasterId === 'evt-001';
    const query = (disasterId && !isMockId) ? `?disaster_id=${disasterId}` : '';
    // await apiClient.get<Alert[]>(`/api/v1/alerts${query}`);
    
    // Simulating API call since there's no actual alert endpoint implemented yet
    return Promise.resolve(MOCK_ALERTS);
  }
};
