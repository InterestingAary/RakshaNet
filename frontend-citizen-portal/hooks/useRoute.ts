/**
 * useRoute.ts
 * Manages evacuation route fetching state for the citizen portal.
 * Calls routingService to compute a route from the user's location to a shelter.
 */

import { useCallback, useRef, useState } from 'react';
import type { EvacuationRoute, LatLng } from '@/types';
import { routingService } from '@/services/routingService';

interface UseRouteReturn {
  route: EvacuationRoute | null;
  isLoadingRoute: boolean;
  routeError: string | null;
  requestRoute: (from: LatLng, toShelterId: string, disasterId?: string) => Promise<void>;
  refreshRoute: (from: LatLng, toShelterId: string, disasterId?: string) => Promise<void>;
  clearRoute: () => void;
  routeStatus: string;
  isRouteBlocked: boolean;
}

export function useRoute(): UseRouteReturn {
  const [route, setRoute] = useState<EvacuationRoute | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const requestRoute = useCallback(
    async (from: LatLng, toShelterId: string, disasterId?: string): Promise<void> => {
      // Cancel any in-flight request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setIsLoadingRoute(true);
      setRouteError(null);

      try {
        const computed = await routingService.getEvacuationRoute(
          from,
          toShelterId,
          abortRef.current.signal,
          disasterId,
        );
        setRoute(computed);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Intentional cancellation — do not set error state
          return;
        }
        const message =
          err instanceof Error ? err.message : 'Failed to calculate route';
        setRouteError(message);
        setRoute(null);
      } finally {
        setIsLoadingRoute(false);
      }
    },
    []
  );

  const refreshRoute = useCallback(
    async (from: LatLng, toShelterId: string, disasterId?: string): Promise<void> => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setIsLoadingRoute(true);
      setRouteError(null);

      try {
        const computed = await routingService.refreshEvacuationRoute(
          from, toShelterId, abortRef.current.signal, disasterId
        );
        setRoute(computed);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setRouteError(err instanceof Error ? err.message : 'Failed to refresh route');
        setRoute(null);
      } finally {
        setIsLoadingRoute(false);
      }
    },
    []
  );

  const clearRoute = useCallback(() => {
    abortRef.current?.abort();
    setRoute(null);
    setRouteError(null);
    setIsLoadingRoute(false);
  }, []);

  const routeStatus: string = (() => {
    if (isLoadingRoute) return 'recalculating';
    if (!route) return 'none';
    return route.status ?? 'active';
  })();

  const isRouteBlocked = route?.status === 'blocked';

  return {
    route,
    isLoadingRoute,
    routeError,
    requestRoute,
    refreshRoute,
    clearRoute,
    routeStatus,
    isRouteBlocked,
  };
}
