'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { BlockedRoad } from '@/types/blockedRoad';
import {
  blockedRoadService,
  MOCK_BLOCKED_ROADS,
} from '@/services/blockedRoadService';

export interface UseBlockedRoadsOptions {
  disasterId?: string;
  initialShow?: boolean;
  autoFetch?: boolean;
}

export interface UseBlockedRoadsReturn {
  blockedRoads: BlockedRoad[];
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  showBlockedRoads: boolean;
  toggleBlockedRoads: () => void;
  setShowBlockedRoads: (show: boolean) => void;
  refresh: () => Promise<void>;
}

export function useBlockedRoads(
  options: UseBlockedRoadsOptions = {}
): UseBlockedRoadsReturn {
  const { disasterId, initialShow = true, autoFetch = true } = options;

  const [blockedRoads, setBlockedRoads] = useState<BlockedRoad[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showBlockedRoads, setShowBlockedRoads] = useState<boolean>(initialShow);

  const mountedRef = useRef(true);

  const fetchBlockedRoads = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await blockedRoadService.getVerifiedBlockedRoads(disasterId);
      if (!mountedRef.current) return;
      setBlockedRoads(data);
    } catch (err) {
      if (!mountedRef.current) return;
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to load verified blocked roads';
      console.warn('[useBlockedRoads] Falling back to demo mock data:', msg);
      setError(msg);
      setBlockedRoads(MOCK_BLOCKED_ROADS);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [disasterId]);

  useEffect(() => {
    mountedRef.current = true;
    if (autoFetch) {
      fetchBlockedRoads();
    }
    return () => {
      mountedRef.current = false;
    };
  }, [autoFetch, fetchBlockedRoads]);

  const toggleBlockedRoads = useCallback(() => {
    setShowBlockedRoads((prev) => !prev);
  }, []);

  const isEmpty = useMemo(() => {
    return !isLoading && !error && blockedRoads.length === 0;
  }, [isLoading, error, blockedRoads]);

  return {
    blockedRoads,
    isLoading,
    error,
    isEmpty,
    showBlockedRoads,
    toggleBlockedRoads,
    setShowBlockedRoads,
    refresh: fetchBlockedRoads,
  };
}
