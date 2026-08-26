'use client';

import React from 'react';
import KPICard from '@/components/ui/KPICard';
import { DisasterEvent, Shelter, IncidentReport, PriorityCase, ResponseTeam } from '@/types';
import { Users, ShieldAlert, HeartPulse, RouteOff, Home, MapPin } from 'lucide-react';

export interface DashboardMetricsProps {
  disaster: DisasterEvent | null;
  shelters: Shelter[];
  incidents: IncidentReport[];
  priorityCases: PriorityCase[];
  responseTeams: ResponseTeam[];
}

export default function DashboardMetrics({
  disaster,
  shelters,
  incidents,
  priorityCases,
  responseTeams
}: DashboardMetricsProps) {
  
  // Calculations
  const affectedPop = disaster?.affectedPopulation || 0;
  
  const criticalCases = priorityCases.filter(c => c.priorityLevel === 1).length;
  const highPriorityCases = priorityCases.filter(c => c.priorityLevel === 2).length;
  const totalEvacuated = priorityCases.filter(c => c.evacuationStatus === 'evacuated' || c.evacuationStatus === 'at_shelter').length;
  const evacuationProgress = priorityCases.length > 0 ? Math.round((totalEvacuated / priorityCases.length) * 100) : 0;
  
  const activeShelters = shelters.filter(s => s.status === 'active').length;
  const totalShelterCapacity = shelters.reduce((acc, s) => acc + s.totalCapacity, 0);
  const totalOccupied = shelters.reduce((acc, s) => acc + s.occupancy, 0);
  const nearCapacityShelters = shelters.filter(s => (s.occupancy / (s.totalCapacity || 1)) > 0.85).length;
  
  const openIncidents = incidents.filter(i => i.status !== 'resolved').length;
  const criticalIncidents = incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;
  
  const availableTeams = responseTeams.filter(t => t.status === 'available').length;
  const blockedRoutes = incidents.filter(i => i.type === 'road_blocked' && i.status !== 'resolved').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-slate-900/50">
      <KPICard
        label="Affected Population"
        value={affectedPop.toLocaleString()}
        icon={<Users className="w-5 h-5 text-indigo-400" />}
        variant="default"
      />
      <KPICard
        label="Critical Cases"
        value={criticalCases}
        subValue={`${highPriorityCases} High Priority`}
        icon={<HeartPulse className="w-5 h-5 text-red-500" />}
        variant="danger"
      />
      <KPICard
        label="Evacuation Progress"
        value={`${evacuationProgress}%`}
        icon={<MapPin className="w-5 h-5 text-emerald-400" />}
        variant="success"
      />
      <KPICard
        label="Shelter Utilization"
        value={`${Math.round((totalOccupied / (totalShelterCapacity || 1)) * 100)}%`}
        subValue={`${totalOccupied.toLocaleString()} / ${totalShelterCapacity.toLocaleString()}`}
        icon={<Home className="w-5 h-5 text-amber-400" />}
        variant={nearCapacityShelters > 0 ? 'warning' : 'default'}
      />
      <KPICard
        label="Active Incidents"
        value={openIncidents}
        subValue={`${criticalIncidents} Critical`}
        icon={<ShieldAlert className="w-5 h-5 text-amber-500" />}
        variant={criticalIncidents > 0 ? 'danger' : 'warning'}
      />
      <KPICard
        label="Response Teams"
        value={availableTeams}
        subValue={`out of ${responseTeams.length} total`}
        icon={<ShieldAlert className="w-5 h-5 text-indigo-400" />}
        variant="default"
      />
      <KPICard
        label="Blocked Routes"
        value={blockedRoutes}
        icon={<RouteOff className="w-5 h-5 text-red-500" />}
        variant="danger"
      />
      <KPICard
        label="Active Shelters"
        value={activeShelters}
        subValue={`${nearCapacityShelters} near capacity`}
        icon={<Home className="w-5 h-5 text-indigo-400" />}
        variant="default"
      />
    </div>
  );
}
