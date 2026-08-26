import type { Severity, LatLng } from './common';

export interface IncidentReport {
  id: string;
  type:
    | 'fallen_tree'
    | 'road_blocked'
    | 'flooded_route'
    | 'medical_emergency'
    | 'fire'
    | 'trapped'
    | 'other';
  location: LatLng;
  address: string;
  description: string;
  imageUrl: string | null;
  videoUrl: string | null;
  reportedBy: 'citizen' | 'authority' | 'system';
  reporterName: string | null;
  status: 'new' | 'reviewing' | 'critical' | 'assigned' | 'resolved';
  severity: Severity;
  assignedTeamId: string | null;
  affectsRouteId: string | null;
  reportedAt: Date;
  updatedAt: Date;
}

export interface NeedHelpRequest {
  id: string;
  category:
    | 'medical'
    | 'mobility'
    | 'child_elderly'
    | 'trapped'
    | 'cannot_evacuate'
    | 'other';
  location: LatLng;
  description: string;
  imageUrl: string | null;
  status: 'submitted' | 'received' | 'assigned' | 'resolved';
  priority: Severity;
  reportId: string;
  assignedTeamId: string | null;
  submittedAt: Date;
}
