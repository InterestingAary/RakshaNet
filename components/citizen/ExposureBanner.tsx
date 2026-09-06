'use client';

import React from 'react';
import {
  AlertOctagon,
  ShieldCheck,
  MapPinOff,
  Navigation,
  Loader2,
  RefreshCw,
  ArrowRight,
  Shield,
} from 'lucide-react';
import type { Shelter, ExposureResponse } from '@/types';

interface ExposureBannerProps {
  exposure: ExposureResponse | null;
  recommendedShelter: Shelter | null;
  recommendedDistanceKm: number | null;
  isLoading: boolean;
  error: string | null;
  isLocationDenied: boolean;
  hasLocation: boolean;
  onSelectShelter?: (shelter: Shelter) => void;
  onRequestRoute?: (shelter: Shelter) => void;
  onRefresh?: () => void;
  onPromptLocation?: () => void;
}

export function ExposureBanner({
  exposure,
  recommendedShelter,
  recommendedDistanceKm,
  isLoading,
  error,
  isLocationDenied,
  hasLocation,
  onSelectShelter,
  onRequestRoute,
  onRefresh,
  onPromptLocation,
}: ExposureBannerProps) {
  // Case 1: Location Permission Denied or Not Set
  if (isLocationDenied || !hasLocation) {
    return (
      <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 rounded-xl text-amber-900 dark:text-amber-200 text-xs shadow-sm space-y-2">
        <div className="flex items-start gap-2.5">
          <MapPinOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block text-sm text-amber-800 dark:text-amber-300">
              {isLocationDenied ? 'Location Access Denied' : 'Location Not Shared'}
            </span>
            <p className="mt-0.5 text-amber-700 dark:text-amber-400">
              Enable location access or click on the map to pinpoint your position for real-time hazard exposure detection and nearest verified shelter recommendations.
            </p>
          </div>
        </div>
        {onPromptLocation && (
          <div className="flex justify-end pt-1">
            <button
              onClick={onPromptLocation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-xs shadow transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              Enable Location
            </button>
          </div>
        )}
      </div>
    );
  }

  // Case 2: Loading State
  if (isLoading) {
    return (
      <div className="p-3.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 text-xs flex items-center gap-3 shadow-sm animate-pulse">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
        <span>Evaluating spatial exposure & querying nearest verified shelter...</span>
      </div>
    );
  }

  // Case 3: Error State
  if (error) {
    return (
      <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/60 rounded-xl text-rose-900 dark:text-rose-200 text-xs flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>Spatial analysis unavailable: {error}</span>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 rounded font-medium hover:bg-rose-300 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        )}
      </div>
    );
  }

  if (!exposure) return null;

  // Case 4: Citizen is Exposed to Verified Hazard Zone
  if (exposure.is_exposed) {
    const zoneNames = exposure.hazard_zones.map((z) => z.name).join(', ');
    return (
      <div className="p-4 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl shadow-lg border border-red-500 space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
            <AlertOctagon className="w-6 h-6 text-white animate-bounce" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider">
                Hazard Exposure Warning
              </span>
              {exposure.highest_severity && (
                <span className="bg-red-900/60 px-1.5 py-0.5 rounded text-[10px] font-bold">
                  Severity {exposure.highest_severity}/5
                </span>
              )}
            </div>
            <h3 className="font-bold text-base mt-1">
              You are inside a verified hazard zone!
            </h3>
            <p className="text-xs text-red-100 mt-0.5">
              Active zone: <strong className="text-white">{zoneNames || 'Flooded / Danger Sector'}</strong>.
              Immediate evacuation to the nearest safe shelter is strongly advised.
            </p>
          </div>
        </div>

        {recommendedShelter && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-red-100">
                <Shield className="w-3.5 h-3.5 text-emerald-300" />
                <span>Recommended Verified Shelter</span>
              </div>
              <p className="font-bold text-sm text-white">
                {recommendedShelter.name}
              </p>
              <p className="text-xs text-red-200">
                {recommendedDistanceKm ? `${recommendedDistanceKm.toFixed(1)} km away` : ''} •{' '}
                {recommendedShelter.totalCapacity - recommendedShelter.occupancy} available spots
              </p>
            </div>
            <div className="flex gap-2">
              {onSelectShelter && (
                <button
                  onClick={() => onSelectShelter(recommendedShelter)}
                  className="px-3 py-1.5 bg-white text-red-700 hover:bg-red-50 rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1"
                >
                  View Details
                </button>
              )}
              {onRequestRoute && (
                <button
                  onClick={() => onRequestRoute(recommendedShelter)}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1"
                >
                  Evacuate <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Case 5: Safe / Outside Hazard Zones
  const distanceMsg = exposure.nearest_hazard_distance_meters
    ? `Nearest hazard zone is ${(exposure.nearest_hazard_distance_meters / 1000).toFixed(1)} km away.`
    : 'No active hazard zones in your immediate perimeter.';

  return (
    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs shadow-sm space-y-2">
      <div className="flex items-start gap-2.5">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-emerald-800 dark:text-emerald-300">
              Outside Hazard Zones
            </span>
            <span className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
              Verified Safe
            </span>
          </div>
          <p className="mt-0.5 text-emerald-700 dark:text-emerald-400">
            {distanceMsg}
          </p>
        </div>
      </div>

      {recommendedShelter && (
        <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-medium">
              Nearest Available Shelter:
            </span>
            <span className="font-bold text-xs text-emerald-950 dark:text-emerald-100">
              {recommendedShelter.name}
            </span>
            {recommendedDistanceKm && (
              <span className="text-emerald-700 dark:text-emerald-400 ml-1.5">
                ({recommendedDistanceKm.toFixed(1)} km)
              </span>
            )}
          </div>
          {onSelectShelter && (
            <button
              onClick={() => onSelectShelter(recommendedShelter)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-xs shadow-sm transition-colors"
            >
              View
            </button>
          )}
        </div>
      )}
    </div>
  );
}
