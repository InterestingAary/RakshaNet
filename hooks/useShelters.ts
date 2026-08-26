/**
 * useShelters.ts
 * Provides filtered shelter data and geospatial lookup helpers.
 */

import { useCallback, useMemo } from 'react';
import { useDisasterContext } from '@/context/DisasterContext';
import { haversineDistance } from '@/lib/utils';
import type { LatLng, Shelter } from '@/types';

interface UseSheltersReturn {
  shelters: Shelter[];
  activeShelters: Shelter[];
  isLoading: boolean;
  getShelter: (id: string) => Shelter | undefined;
  getNearbyShelters: (location: LatLng, limit?: number) => Shelter[];
}

export function useShelters(): UseSheltersReturn {
  const { shelters, isLoading } = useDisasterContext();

  const activeShelters = useMemo(
    () => shelters.filter((s) => s.status === 'active'),
    [shelters]
  );

  const getShelter = useCallback(
    (id: string): Shelter | undefined => shelters.find((s) => s.id === id),
    [shelters]
  );

  const getNearbyShelters = useCallback(
    (location: LatLng, limit = 5): Shelter[] => {
      return [...shelters]
        .filter((s) => s.status === 'active')
        .map((s) => ({
          shelter: s,
          distance: haversineDistance(location, s.location),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit)
        .map(({ shelter }) => shelter);
    },
    [shelters]
  );

  return {
    shelters,
    activeShelters,
    isLoading,
    getShelter,
    getNearbyShelters,
  };
}
