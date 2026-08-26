import type { LatLng } from './common';

export interface ResponseTeam {
  id: string;
  name: string;
  type: 'rescue' | 'medical' | 'police' | 'fire' | 'ngo' | 'volunteer';
  location: LatLng;
  status: 'available' | 'assigned' | 'enroute' | 'on_scene' | 'offline';
  assignedIncidentId: string | null;
  assignedPriorityCaseId: string | null;
  contactPhone: string;
  memberCount: number;
  updatedAt: Date;
}
