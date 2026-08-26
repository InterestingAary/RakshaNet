import { Alert } from '@/types';
import { MOCK_ALERTS } from '@/mock/disasterData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const alertService = {
  async getAlerts(disasterEventId: string): Promise<Alert[]> {
    await delay(300);
    return MOCK_ALERTS.filter(alert => alert.disasterEventId === disasterEventId);
  }
};
