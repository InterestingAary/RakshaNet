'use client';

import React, { useState } from 'react';
import { IncidentReport } from '@/types/incident';
import { ResponseTeam } from '@/types/response';
import { AlertOctagon, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface IncidentManagementProps {
  incidents: IncidentReport[];
  teams: ResponseTeam[];
  onUpdateStatus: (id: string, status: 'pending' | 'assigned' | 'in_progress' | 'resolved') => void;
  onAssignTeam: (incidentId: string, teamId: string) => Promise<void>;
}

export default function IncidentManagement({ incidents, teams, onUpdateStatus, onAssignTeam }: IncidentManagementProps) {
  const [filter, setFilter] = useState<'all' | 'open' | 'critical'>('open');

  const filteredIncidents = incidents.filter(i => {
    if (filter === 'all') return true;
    if (filter === 'open') return i.status !== 'resolved';
    if (filter === 'critical') return i.severity === 'critical' && i.status !== 'resolved';
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-emerald-400 bg-emerald-400/10';
      case 'in_progress': return 'text-indigo-400 bg-indigo-400/10';
      case 'assigned': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-amber-400 bg-amber-400/10';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${filter === 'all' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('open')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${filter === 'open' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
        >
          Open
        </button>
        <button
          onClick={() => setFilter('critical')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${filter === 'critical' ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
        >
          Critical
        </button>
      </div>

      <div className="grid gap-3">
        {filteredIncidents.length === 0 ? (
          <div className="text-center p-8 text-slate-500 bg-slate-900 rounded-lg border border-slate-800">
            No incidents match the current filter.
          </div>
        ) : (
          filteredIncidents.map(incident => (
            <div key={incident.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:border-slate-700 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`mt-1 p-2 rounded-lg ${getSeverityColor(incident.severity)}`}>
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white capitalize">{incident.type.replace('_', ' ')}</span>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold border ${getSeverityColor(incident.severity)}`}>
                      {incident.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-1">{incident.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {format(new Date(incident.reportedAt), 'HH:mm')}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {incident.location?.lat.toFixed(4)}, {incident.location?.lng.toFixed(4)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                <div className={`px-3 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider whitespace-nowrap ${getStatusColor(incident.status)}`}>
                  {incident.status.replace('_', ' ')}
                </div>
                
                {incident.status !== 'resolved' && (
                  <select
                    className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded focus:ring-indigo-500 focus:border-indigo-500 block w-full md:w-40 p-2"
                    value={incident.assignedTeamId || ''}
                    onChange={(e) => onAssignTeam(incident.id, e.target.value)}
                  >
                    <option value="">Assign Team...</option>
                    {teams.filter(t => t.status === 'available' || t.id === incident.assignedTeamId).map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.status})
                      </option>
                    ))}
                  </select>
                )}
                
                {incident.status !== 'resolved' && (
                  <button
                    onClick={() => onUpdateStatus(incident.id, 'resolved')}
                    className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded transition-colors"
                    title="Mark Resolved"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
