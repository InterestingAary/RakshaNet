'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { LatLng, Shelter, ExposureResponse } from '@/types';
import { exposureService } from '@/services/exposureService';
import { shelterService } from '@/services/shelterService';

export interface UseCitizenExposureOptions {
  location: LatLng | null;
  permissionStatus: string;
}

export interface UseCitizenExposureReturn {
  exposure: ExposureResponse | null;
  recommendedShelter: Shelter | null;
  recommendedDistanceKm: number | null;
  availableShelters: Shelter[];
  isLoading: boolean;
  error: string | null;
  isLocationDenied: boolean;
  isLocationAvailable: boolean;
  refresh: () => Promise<void>;
}

export function useCitizenExposure({
  location,
  permissionStatus,
}: UseCitizenExposureOptions): UseCitizenExposureReturn {
  const [exposure, setExposure] = useState<ExposureResponse | null>(null);
  const [recommendedShelter, setRecommendedShelter] = useState<Shelter | null>(null);
  const [recommendedDistanceKm, setRecommendedDistanceKm] = useState<number | null>(null);
  const [availableShelters, setAvailableShelters] = useState<Shelter[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  const isLocationDenied = permissionStatus === 'denied';
  const isLocationAvailable = Boolean(location && !isLocationDenied);

  const evaluateSpatialState = useCallback(async () => {
    if (!location) {
      setExposure(null);
      setRecommendedShelter(null);
      setRecommendedDistanceKm(null);
      setAvailableShelters([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [exposureResult, recommendationResult] = await Promise.all([
        exposureService.checkExposure(location),
        shelterService.recommendShelter(location),
      ]);

      if (!mountedRef.current) return;

      setExposure(exposureResult);
      setRecommendedShelter(recommendationResult.recommended_shelter);
      setRecommendedDistanceKm(recommendationResult.distance_km);
      setAvailableShelters(recommendationResult.available_shelters);
    } catch (err) {
      if (!mountedRef.current) return;
      const msg = err instanceof Error ? err.message : 'Failed to analyze spatial exposure or recommend shelter';
      console.warn('[useCitizenExposure] Spatial evaluation error:', msg);
      setError(msg);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [location]);

  useEffect(() => {
    mountedRef.current = true;
    if (location) {
      evaluateSpatialState();
    }
    return () => {
      mountedRef.current = false;
    };
  }, [location, evaluateSpatialState]);

  return {
    exposure,
    recommendedShelter,
    recommendedDistanceKm,
    availableShelters,
    isLoading,
    error,
    isLocationDenied,
    isLocationAvailable,
    refresh: evaluateSpatialState,
  };
}
