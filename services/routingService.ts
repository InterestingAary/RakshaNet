import { EvacuationRoute, LatLng } from '@/types';
import { MOCK_EVACUATION_ROUTE, MOCK_ALTERNATIVE_ROUTE, MOCK_BLOCKED_ROUTE } from '@/mock/routeData';

const delay = (ms: number, signal?: AbortSignal) => new Promise((resolve, reject) => {
  const timeoutId = setTimeout(resolve, ms);
  if (signal) {
    signal.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  }
});

export const routingService = {
  async getSafeRoute(from: LatLng, toShelterId: string): Promise<EvacuationRoute> {
    await delay(300);
    return MOCK_EVACUATION_ROUTE;
  },

  async getAlternativeRoute(from: LatLng, toShelterId: string): Promise<EvacuationRoute> {
    await delay(300);
    return MOCK_ALTERNATIVE_ROUTE;
  },

  async reportRouteBlocked(routeId: string, incidentId: string): Promise<void> {
    await delay(300);
    console.log(`Route ${routeId} reported blocked due to incident ${incidentId}`);
  },

  async getEvacuationRoute(from: LatLng, toShelterId: string, signal?: AbortSignal): Promise<EvacuationRoute> {
    await delay(400, signal);
    return MOCK_EVACUATION_ROUTE;
  }
};
