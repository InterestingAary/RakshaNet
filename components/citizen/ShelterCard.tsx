'use client';

import React from 'react';
import { Shelter } from '@/types';
import { MapPin, Activity, Accessibility, ShieldCheck, ShieldAlert } from 'lucide-react';

interface ShelterCardProps {
  shelter: Shelter;
  onSelect: (shelter: Shelter) => void;
  isSelected: boolean;
  distanceKm: number | null;
}

export function ShelterCard({ shelter, onSelect, isSelected, distanceKm }: ShelterCardProps) {
  const occupancyRate = (shelter.occupancy / shelter.totalCapacity) * 100;
  
  let statusColor = 'bg-green-500';
  if (occupancyRate > 90) statusColor = 'bg-red-500';
  else if (occupancyRate > 75) statusColor = 'bg-amber-500';

  const isFull = shelter.occupancy >= shelter.totalCapacity || shelter.status === 'full';

  return (
    <div 
      onClick={() => onSelect(shelter)}
      className={`p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected 
          ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-500 shadow-sm' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">
            {shelter.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {distanceKm !== null ? (
              <span>{distanceKm.toFixed(1)} km away</span>
            ) : (
              <span className="line-clamp-1">{shelter.address || 'Address unavailable'}</span>
            )}
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
          isFull ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
          : shelter.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
        }`}>
          {isFull ? 'Full' : shelter.status}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-600 dark:text-slate-400">Capacity</span>
          <span className="font-medium text-slate-900 dark:text-slate-200">
            {shelter.occupancy} / {shelter.totalCapacity}
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${statusColor}`}
            style={{ width: `${Math.min(occupancyRate, 100)}%` }}
          />
        </div>
        {shelter.effectiveAvailableCapacity < shelter.totalCapacity - shelter.occupancy && (
          <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
            Effective available: {shelter.effectiveAvailableCapacity}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
        {shelter.hasMedicalFacility && (
          <div className="flex items-center gap-1 text-xs" title="Medical Facilities Available">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Medical</span>
          </div>
        )}
        {shelter.facilities?.includes('accessibility') && (
          <div className="flex items-center gap-1 text-xs" title="Wheelchair Accessible">
            <Accessibility className="w-4 h-4 text-blue-500" />
            <span className="hidden sm:inline">Accessible</span>
          </div>
        )}
        {shelter.type === 'hospital' || shelter.type === 'stadium' ? (
          <div className="flex items-center gap-1 text-xs" title="Primary Evacuation Center">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Primary</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs" title="Secondary Shelter">
            <ShieldAlert className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Secondary</span>
          </div>
        )}
      </div>
    </div>
  );
}
