'use client';

import React from 'react';
import { ResponseTeam } from '@/types/response';
import { IncidentReport } from '@/types/incident';
import { PriorityCase } from '@/types/priority';
import { Shield, Users, Activity, Crosshair } from 'lucide-react';

interface ResponseTeamPanelProps {
  teams: ResponseTeam[];
  incidents: IncidentReport[];
  priorityCases: PriorityCase[];
  onAssign: (teamId: string) => void;
}

export default function ResponseTeamPanel({ teams, incidents, priorityCases, onAssign }: ResponseTeamPanelProps) {

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'deployed': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'en_route': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'offline': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getTeamTypeIcon = (type: string) => {
    switch (type) {
      case 'medical': return <Activity className="w-5 h-5" />;
      case 'rescue': return <Shield className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {teams.map(team => {
        // Find current assignment details if any
        let assignmentName = null;
        if (team.assignedIncidentId) {
          const caseAssigned = priorityCases.find(c => c.id === team.assignedIncidentId);
          if (caseAssigned) assignmentName = `Case: ${caseAssigned.name}`;
          else {
            const incidentAssigned = incidents.find(i => i.id === team.assignedIncidentId);
            if (incidentAssigned) assignmentName = `Incident: ${incidentAssigned.type}`;
          }
        }

        return (
          <div key={team.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-slate-800 text-slate-400`}>
                  {getTeamTypeIcon(team.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{team.name}</h3>
                  <span className="text-xs text-slate-400 capitalize">{team.type} Team</span>
                </div>
              </div>
              <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(team.status)}`}>
                {team.status.replace('_', ' ')}
              </div>
            </div>

            <div className="mt-auto space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-1"><Users className="w-4 h-4" /> Personnel</span>
                <span className="text-slate-300 font-medium">{team.memberCount} members</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-1"><Crosshair className="w-4 h-4" /> Task</span>
                <span className="text-slate-300 font-medium line-clamp-1 text-right max-w-[150px]">
                  {assignmentName || 'Unassigned'}
                </span>
              </div>

              <button
                onClick={() => onAssign(team.id)}
                disabled={team.status === 'offline'}
                className="w-full mt-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Manage Assignment
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
