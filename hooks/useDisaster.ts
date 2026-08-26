/**
 * useDisaster.ts
 * Wraps DisasterContext and adds computed derived values so components
 * don't need to derive them inline.
 */

import { useMemo } from 'react';
import { useDisasterContext } from '@/context/DisasterContext';
import type {
  Alert,
  DisasterEvent,
  HazardZone,
  IncidentReport,
  PriorityCase,
  ResponseTeam,
  Shelter,
  TimelineEvent,
} from '@/types';

interface UseDisasterReturn {
  // ---- Raw context values ----
  activeDisaster: DisasterEvent | null;
  hazardZones: HazardZone[];
  alerts: Alert[];
  timeline: TimelineEvent[];
  shelters: Shelter[];
  incidents: IncidentReport[];
  priorityCases: PriorityCase[];
  responseTeams: ResponseTeam[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateShelter: (shelter: Shelter) => void;
  updateIncident: (incident: IncidentReport) => void;
  addTimelineEvent: (event: TimelineEvent) => void;
  addIncident: (incident: IncidentReport) => void;

  // ---- Computed selectors ----
  /** Number of people who have successfully reached a shelter */
  totalEvacuated: number;
  /** Percentage of at-risk population evacuated (0–100) */
  evacuationProgress: number;
  /** Count of incidents with severity === 'critical' */
  criticalIncidentCount: number;
  /** Count of shelters with status === 'active' */
  activeShelterCount: number;
}

export function useDisaster(): UseDisasterReturn {
  const ctx = useDisasterContext();

  const totalEvacuated = useMemo(
    () => ctx.shelters.reduce((sum, s) => sum + s.occupancy, 0),
    [ctx.shelters]
  );

  const evacuationProgress = useMemo(() => {
    const total = ctx.activeDisaster?.affectedPopulation ?? 0;
    if (total === 0) return 0;
    return Math.min(100, Math.round((totalEvacuated / total) * 100));
  }, [ctx.activeDisaster?.affectedPopulation, totalEvacuated]);

  const criticalIncidentCount = useMemo(
    () =>
      ctx.incidents.filter(
        (i) => i.severity === 'critical' && i.status !== 'resolved'
      ).length,
    [ctx.incidents]
  );

  const activeShelterCount = useMemo(
    () => ctx.shelters.filter((s) => s.status === 'active').length,
    [ctx.shelters]
  );

  return {
    ...ctx,
    totalEvacuated,
    evacuationProgress,
    criticalIncidentCount,
    activeShelterCount,
  };
}
