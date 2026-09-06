'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HazardZone } from '@/types/disaster';
import { hazardService } from '@/services/hazardService';
import { MOCK_HAZARD_ZONES } from '@/mock/disasterData';

export interface UseHazardsOptions {
  disasterId?: string;
  initialShow?: boolean;
  autoFetch?: boolean;
}

export interface UseHazardsReturn {
  hazards: HazardZone[];
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  showHazards: boolean;
  toggleHazards: () => void;
  setShowHazards: (show: boolean) => void;
  refresh: () => Promise<void>;
}

export function useHazards(options: UseHazardsOptions = {}): UseHazardsReturn {
  const { disasterId, initialShow = true, autoFetch = true } = options;

  const [hazards, setHazards] = useState<HazardZone[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showHazards, setShowHazards] = useState<boolean>(initialShow);

  const mountedRef = useRef(true);

  const fetchHazards = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await hazardService.getVerifiedHazards(disasterId);
      if (!mountedRef.current) return;
      setHazards(data);
    } catch (err) {
      if (!mountedRef.current) return;
      const msg = err instanceof Error ? err.message : 'Failed to load verified hazard zones';
      console.warn('[useHazards] Falling back to mock hazard data:', msg);
      setError(msg);
      // Preserve demo mode / fallback
      setHazards(MOCK_HAZARD_ZONES);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [disasterId]);

  useEffect(() => {
    mountedRef.current = true;
    if (autoFetch) {
      fetchHazards();
    }
    return () => {
      mountedRef.current = false;
    };
  }, [autoFetch, fetchHazards]);

  const toggleHazards = useCallback(() => {
    setShowHazards((prev) => !prev);
  }, []);

  const isEmpty = useMemo(() => {
    return !isLoading && !error && hazards.length === 0;
  }, [isLoading, error, hazards]);

  return {
    hazards,
    isLoading,
    error,
    isEmpty,
    showHazards,
    toggleHazards,
    setShowHazards,
    refresh: fetchHazards,
  };
}
