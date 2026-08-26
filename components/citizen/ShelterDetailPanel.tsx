'use client';

import React from 'react';
import { Shelter } from '@/types';
import { X, Navigation, MapPin, Phone, Users, Activity, Coffee, Bed, Accessibility, Battery, Droplets } from 'lucide-react';

interface ShelterDetailPanelProps {
  shelter: Shelter | null;
  onClose: () => void;
  onRequestRoute: (shelter: Shelter) => void;
}

export function ShelterDetailPanel({ shelter, onClose, onRequestRoute }: ShelterDetailPanelProps) {
  if (!shelter) return null;

  const occupancyRate = (shelter.occupancy / shelter.totalCapacity) * 100;
  const isFull = shelter.occupancy >= shelter.totalCapacity || shelter.status === 'full';

  const facilityIcons: Record<string, React.ReactNode> = {
    medical: <Activity className="w-5 h-5 text-emerald-500" />,
    food: <Coffee className="w-5 h-5 text-amber-500" />,
    sleeping: <Bed className="w-5 h-5 text-indigo-500" />,
    accessibility: <Accessibility className="w-5 h-5 text-blue-500" />,
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 md:right-0 md:left-auto md:top-0 md:bottom-0 md:w-96 bg-white dark:bg-slate-900 shadow-2xl border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="font-bold text-lg text-slate-900 dark:text-white">Shelter Details</h2>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md ${
              shelter.type === 'hospital' || shelter.type === 'stadium'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}>
              {shelter.type.replace('_', ' ')}
            </span>
            <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md ${
              isFull ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
              : shelter.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {isFull ? 'full' : shelter.status}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{shelter.name}</h1>
          
          {shelter.address && (
            <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400 mt-3">
              <MapPin className="w-5 h-5 shrink-0 text-slate-400" />
              <span className="text-sm">{shelter.address}</span>
            </div>
          )}
          {shelter.contactPhone && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mt-2">
              <Phone className="w-5 h-5 shrink-0 text-slate-400" />
              <span className="text-sm">{shelter.contactPhone}</span>
            </div>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white mb-4">
            <Users className="w-5 h-5 text-blue-500" />
            Capacity & Occupancy
          </div>
          
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Current Occupancy</span>
            <span className="font-medium text-slate-900 dark:text-white">
              {shelter.occupancy} / {shelter.totalCapacity}
            </span>
          </div>
          
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-2">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                occupancyRate > 90 ? 'bg-red-500' : occupancyRate > 75 ? 'bg-amber-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(occupancyRate, 100)}%` }}
            />
          </div>
          <p className="text-xs text-right text-slate-500">
            {isFull ? 'Shelter is currently full' : `${shelter.effectiveAvailableCapacity} spots available`}
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Available Facilities</h3>
          <div className="grid grid-cols-2 gap-3">
            {shelter.hasMedicalFacility && (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <Activity className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Medical</span>
              </div>
            )}
            {shelter.hasPowerBackup && (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <Battery className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Power Backup</span>
              </div>
            )}
            {shelter.hasWater && (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <Droplets className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Water</span>
              </div>
            )}
            {shelter.hasFood && (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <Coffee className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Food</span>
              </div>
            )}
            {shelter.facilities?.map((facility) => (
              <div key={facility} className="flex items-center gap-2 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                {facilityIcons[facility] || <Activity className="w-5 h-5 text-slate-400" />}
                <span className="text-sm capitalize font-medium text-slate-700 dark:text-slate-300">
                  {facility}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <button
          onClick={() => onRequestRoute(shelter)}
          disabled={isFull}
          className={`w-full py-3.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
            isFull 
              ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'
          }`}
        >
          <Navigation className="w-5 h-5" />
          {isFull ? 'Shelter Full - Cannot Route' : 'Get Route to This Shelter'}
        </button>
      </div>
    </div>
  );
}
