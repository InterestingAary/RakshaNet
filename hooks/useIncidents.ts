/**
 * useIncidents.ts
 * Provides incident data grouped by status and filtered for critical items,
 * plus mutation helpers that delegate to DisasterContext.
 */

import { useCallback, useMemo } from 'react';
import { useDisasterContext } from '@/context/DisasterContext';
import type { IncidentReport } from '@/types';

interface UseIncidentsReturn {
  incidents: IncidentReport[];
  incidentsByStatus: Record<string, IncidentReport[]>;
  criticalIncidents: IncidentReport[];
  addIncident: (incident: IncidentReport) => void;
  updateIncident: (id: string, updates: Partial<IncidentReport>) => void;
}

export function useIncidents(): UseIncidentsReturn {
  const { incidents, addIncident: ctxAdd, updateIncident: ctxUpdate } =
    useDisasterContext();

  const incidentsByStatus = useMemo(() => {
    return incidents.reduce<Record<string, IncidentReport[]>>((acc, incident) => {
      const key = incident.status;
      if (!acc[key]) acc[key] = [];
      acc[key].push(incident);
      return acc;
    }, {});
  }, [incidents]);

  const criticalIncidents = useMemo(
    () =>
      incidents.filter(
        (i) => i.severity === 'critical' && i.status !== 'resolved'
      ),
    [incidents]
  );

  const addIncident = useCallback(
    (incident: IncidentReport) => {
      ctxAdd(incident);
    },
    [ctxAdd]
  );

  const updateIncident = useCallback(
    (id: string, updates: Partial<IncidentReport>) => {
      const existing = incidents.find((i) => i.id === id);
      if (!existing) return;
      ctxUpdate({ ...existing, ...updates });
    },
    [incidents, ctxUpdate]
  );

  return {
    incidents,
    incidentsByStatus,
    criticalIncidents,
    addIncident,
    updateIncident,
  };
}
