import type { Severity, LatLng, BoundingBox } from './common';

export interface DisasterEvent {
  id: string;
  name: string;
  type: 'flood' | 'cyclone' | 'earthquake' | 'fire' | 'other';
  severity: Severity;
  affectedArea: BoundingBox;
  description: string;
  startTime: Date;
  status: 'active' | 'monitoring' | 'resolved';
  instructions: string;
  affectedPopulation: number;
  createdBy: string;
  updatedAt: Date;
}

export interface HazardZone {
  id: string;
  disasterEventId: string;
  name: string;
  severity: Severity;
  polygon: LatLng[];
  type: 'flood' | 'fire' | 'structural' | 'chemical';
  description: string;
  updatedAt: Date;
}
