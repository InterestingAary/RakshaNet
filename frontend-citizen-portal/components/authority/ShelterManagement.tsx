'use client';

import React from 'react';
import { Shelter } from '@/types/shelter';
import { Home, Users, CheckCircle2, XCircle } from 'lucide-react';

interface ShelterManagementProps {
  shelters: Shelter[];
  onUpdate: (shelter: Shelter) => void;
}

export default function ShelterManagement({ shelters, onUpdate }: ShelterManagementProps) {
  if (shelters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-slate-900 rounded-lg border border-slate-800">
        <Home className="w-12 h-12 mb-4 opacity-50" />
        <p>No shelters configured.</p>
      </div>
    );
  }

  const handleToggleStatus = (shelter: Shelter) => {
    if (shelter.occupancy >= shelter.totalCapacity) {
      // It's full, so "Set Active" means freeing up space (or just making it active if inactive)
      onUpdate({ ...shelter, occupancy: Math.max(0, shelter.totalCapacity - 10), status: 'active' });
    } else {
      // It's not full, so "Mark Full" means maximizing occupancy
      onUpdate({ ...shelter, occupancy: shelter.totalCapacity });
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-800/50 text-xs uppercase text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium">Shelter Name & Location</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Occupancy</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {shelters.map((shelter) => {
            const occupancyRate = (shelter.occupancy / shelter.totalCapacity) * 100;
            const isNearCapacity = occupancyRate > 85;
            
            return (
              <tr key={shelter.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${shelter.status === 'active' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                      <Home className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{shelter.name}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]">{shelter.address || 'Address unavailable'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    shelter.occupancy >= shelter.totalCapacity ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    shelter.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}>
                    {shelter.occupancy >= shelter.totalCapacity ? <XCircle className="w-3 h-3" /> : (shelter.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />)}
                    <span className="capitalize">{shelter.occupancy >= shelter.totalCapacity ? 'full' : shelter.status}</span>
                  </span>
                </td>
                <td className="px-4 py-3 min-w-[200px]">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{shelter.occupancy} / {shelter.totalCapacity}</span>
                    </div>
                    <span className={`text-xs font-medium ${isNearCapacity ? 'text-amber-400' : 'text-slate-400'}`}>
                      {Math.round(occupancyRate)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${isNearCapacity ? 'bg-amber-500' : 'bg-indigo-500'}`}
                      style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleToggleStatus(shelter)}
                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {shelter.occupancy >= shelter.totalCapacity ? 'Free Up Space' : 'Mark Full'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
