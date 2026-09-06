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

export interface GeoJSONMultiPolygon {
  type: 'MultiPolygon';
  coordinates: number[][][][]; // [ [ [ [lon, lat], ... ] ] ]
}

export interface HazardZone {
  id: string;
  disasterEventId?: string;
  disaster_id?: string;
  name: string;
  severity: Severity | number;
  polygon?: LatLng[];
  geometry?: GeoJSONMultiPolygon;
  type?: 'flood' | 'fire' | 'structural' | 'chemical' | string;
  description?: string;
  source?: string;
  verified?: boolean;
  updatedAt?: Date;
  created_at?: string;
  updated_at?: string;
}

