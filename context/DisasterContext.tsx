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
import { disasterService } from '@/services/disasterService';
import { shelterService } from '@/services/shelterService';
import { alertService } from '@/services/alertService';
import { incidentService } from '@/services/incidentService';

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------

interface DisasterContextValue {
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
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const DisasterContext = createContext<DisasterContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface DisasterProviderProps {
  children: React.ReactNode;
}

export function DisasterProvider({ children }: DisasterProviderProps) {
      const [activeDisaster, setActiveDisaster] = useState<DisasterEvent | null>(
    null
  );
      const [hazardZones, setHazardZones] = useState<HazardZone[]>([]);
      const [alerts, setAlerts] = useState<Alert[]>([]);
      const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
      const [shelters, setShelters] = useState<Shelter[]>([]);
      const [incidents, setIncidents] = useState<IncidentReport[]>([]);
      const [priorityCases, setPriorityCases] = useState<PriorityCase[]>([]);
      const [responseTeams, setResponseTeams] = useState<ResponseTeam[]>([]);
      const [isLoading, setIsLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const disaster = await disasterService.getActiveDisaster().catch(() => null);
      const disasterId = disaster?.id || "evt-001";
      const [
        zones,
        fetchedAlerts,
        fetchedTimeline,
        fetchedShelters,
        fetchedIncidents,
        cases,
        teams,
      ] = await Promise.all([
        disasterService.getHazardZones(disasterId).catch(() => []),
        alertService.getAlerts(disasterId).catch(() => []),
        disasterService.getTimeline(disasterId).catch(() => []),
        shelterService.getShelters().catch(() => []),
        incidentService.getIncidents().catch(() => []),
        disasterService.getPriorityCases().catch(() => []),
        disasterService.getResponseTeams().catch(() => []),
      ]);

      if (!mountedRef.current) return;

      setActiveDisaster(disaster);
      setHazardZones(zones);
      setAlerts(fetchedAlerts);
      setTimeline(fetchedTimeline);
      setShelters(fetchedShelters);
      setIncidents(fetchedIncidents);
      setPriorityCases(cases);
      setResponseTeams(teams);
    } catch (err) {
      if (!mountedRef.current) return;
      const message =
        err instanceof Error ? err.message : 'Failed to load emergency data';
      setError(message);
      console.error('[DisasterContext] Load error:', err);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  // ---------------------------------------------------------------------------
  // Mutation helpers (optimistic local-state updates)
  // ---------------------------------------------------------------------------

  const updateShelter = useCallback((updated: Shelter) => {
    setShelters((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  }, []);

  const updateIncident = useCallback((updated: IncidentReport) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === updated.id ? updated : i))
    );
  }, []);

  const addTimelineEvent = useCallback((event: TimelineEvent) => {
    setTimeline((prev) => [event, ...prev]);
  }, []);

  const addIncident = useCallback((incident: IncidentReport) => {
    setIncidents((prev) => [incident, ...prev]);
  }, []);

  // ---------------------------------------------------------------------------
  // Value
  // ---------------------------------------------------------------------------

  const value = useMemo<DisasterContextValue>(
    () => ({
      activeDisaster,
      hazardZones,
      alerts,
      timeline,
      shelters,
      incidents,
      priorityCases,
      responseTeams,
      isLoading,
      error,
      refresh: load,
      updateShelter,
      updateIncident,
      addTimelineEvent,
      addIncident,
    }),
    [
      activeDisaster,
      hazardZones,
      alerts,
      timeline,
      shelters,
      incidents,
      priorityCases,
      responseTeams,
      isLoading,
      error,
      load,
      updateShelter,
      updateIncident,
      addTimelineEvent,
      addIncident,
    ]
  );

  return (
    <DisasterContext.Provider value={value}>
      {children}
    </DisasterContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useDisasterContext(): DisasterContextValue {
  const ctx = useContext(DisasterContext);
  if (!ctx) {
    throw new Error(
      'useDisasterContext must be used within a DisasterProvider'
    );
  }
  return ctx;
}
