import type { Severity } from './common';

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  type:
    | 'event_created'
    | 'shelter_activated'
    | 'priority_identified'
    | 'route_blocked'
    | 'route_recalculated'
    | 'incident_reported'
    | 'incident_assigned'
    | 'incident_resolved'
    | 'team_assigned'
    | 'capacity_update'
    | 'evacuation_update'
    | 'alert_issued';
  title: string;
  description: string;
  severity: Severity | null;
  relatedEntityId: string | null;
  relatedEntityType: string | null;
}
