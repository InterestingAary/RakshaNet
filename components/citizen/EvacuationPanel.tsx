'use client';

import React from 'react';
import { EvacuationRoute } from '@/types';
import { Navigation, Loader2, AlertOctagon, AlertTriangle, CheckCircle, Clock, MapPin, X, RefreshCw } from 'lucide-react';

interface EvacuationPanelProps {
  route: EvacuationRoute | null;
  isLoading: boolean;
  onRecalculate: () => void;
  onClearRoute: () => void;
}

export function EvacuationPanel({ route, isLoading, onRecalculate, onClearRoute }: EvacuationPanelProps) {
  if (!route && !isLoading) return null;

  const renderStatusBanner = () => {
    if (!route) return null;
    
    switch (route.status) {
      case 'blocked':
        return (
          <div className="bg-red-500/10 border-l-4 border-red-500 p-3 mb-4 rounded-r-lg">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-medium">
              <AlertOctagon className="w-5 h-5" />
              Route Blocked / Unsafe
            </div>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1">
              Hazards detected on this route. Please recalculate or seek immediate shelter.
            </p>
          </div>
        );
      case 'caution':
        return (
          <div className="bg-amber-500/10 border-l-4 border-amber-500 p-3 mb-4 rounded-r-lg">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium">
              <AlertTriangle className="w-5 h-5" />
              Proceed with Caution
            </div>
            <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
              Minor hazards nearby. Stay alert and follow instructions.
            </p>
          </div>
        );
      case 'safe':
      default:
        return (
          <div className="bg-green-500/10 border-l-4 border-green-500 p-3 mb-4 rounded-r-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium">
              <CheckCircle className="w-5 h-5" />
              Safe Route Found
            </div>
            <p className="text-sm text-green-600 dark:text-green-300 mt-1">
              This route currently avoids known hazard zones.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col mb-4 relative">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <Navigation className="w-5 h-5 text-blue-500" />
          Evacuation Route
        </div>
        {!isLoading && route && (
          <button 
            onClick={onClearRoute}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Clear Route"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
            <p>Calculating optimal route...</p>
          </div>
        ) : route ? (
          <>
            {renderStatusBanner()}
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              {route.estimatedTimeMin !== undefined && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
                    <Clock className="w-4 h-4" /> Est. Time
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {route.estimatedTimeMin} min
                  </div>
                </div>
              )}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
                  <MapPin className="w-4 h-4" /> Distance
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {route.distanceKm.toFixed(1)} km
                </div>
              </div>
            </div>

            {route.warnings && route.warnings.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Route Warnings</h4>
                <div className="space-y-2">
                  {route.warnings.map((warning, idx) => (
                    <div key={warning.id || idx} className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/10 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900/30">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-amber-800 dark:text-amber-300">{warning.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onRecalculate}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Recalculate Route
            </button>
          </>
        ) : (
          <div className="text-center py-6 text-slate-500">
            <p>No route selected.</p>
          </div>
        )}
      </div>
    </div>
  );
}
