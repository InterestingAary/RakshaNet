'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { LatLng } from '@/types';

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------

type PermissionStatus = 'unknown' | 'granted' | 'denied' | 'requesting';

interface LocationContextValue {
  location: LatLng | null;
  permissionStatus: PermissionStatus;
  requestLocation: () => Promise<void>;
  setManualLocation: (location: LatLng) => void;
  clearLocation: () => void;
  isUsingManualLocation: boolean;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const LocationContext = createContext<LocationContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface LocationProviderProps {
  children: React.ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus>('unknown');
  const [isUsingManualLocation, setIsUsingManualLocation] = useState(false);
  const mountedRef = useRef(true);
  const watchIdRef = useRef<number | null>(null);

  // Query initial permission state without requesting location
  useEffect(() => {
    mountedRef.current = true;

    if (typeof navigator === 'undefined' || !navigator.permissions) {
      return;
    }

    navigator.permissions
      .query({ name: 'geolocation' })
      .then((result) => {
        if (!mountedRef.current) return;

        const map: Record<PermissionState, PermissionStatus> = {
          granted: 'granted',
          denied: 'denied',
          prompt: 'unknown',
        };
        setPermissionStatus(map[result.state]);

        result.onchange = () => {
          if (!mountedRef.current) return;
          setPermissionStatus(map[result.state]);
        };
      })
      .catch(() => {
        // Permissions API not supported — stay as 'unknown'
      });

    return () => {
      mountedRef.current = false;
      if (watchIdRef.current !== null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const requestLocation = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setPermissionStatus('denied');
      return;
    }

    setPermissionStatus('requesting');
    setIsUsingManualLocation(false);

    return new Promise<void>((resolve, reject) => {
      // Clear any previous watcher
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          if (!mountedRef.current) return;
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setPermissionStatus('granted');
          resolve();
        },
        (err) => {
          if (!mountedRef.current) return;
          console.warn('[LocationContext] Geolocation error:', err.message);
          setPermissionStatus(
            err.code === GeolocationPositionError.PERMISSION_DENIED
              ? 'denied'
              : 'unknown'
          );
          reject(new Error(err.message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10_000,
          maximumAge: 30_000,
        }
      );
    });
  }, []);

  const setManualLocation = useCallback((loc: LatLng) => {
    // Stop watching GPS if active
    if (watchIdRef.current !== null) {
      navigator.geolocation?.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setLocation(loc);
    setIsUsingManualLocation(true);
    setPermissionStatus('granted');
  }, []);

  const clearLocation = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation?.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setLocation(null);
    setIsUsingManualLocation(false);
    setPermissionStatus('unknown');
  }, []);

  const value = useMemo<LocationContextValue>(
    () => ({
      location,
      permissionStatus,
      requestLocation,
      setManualLocation,
      clearLocation,
      isUsingManualLocation,
    }),
    [
      location,
      permissionStatus,
      requestLocation,
      setManualLocation,
      clearLocation,
      isUsingManualLocation,
    ]
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useLocationContext(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error(
      'useLocationContext must be used within a LocationProvider'
    );
  }
  return ctx;
}
