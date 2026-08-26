import type { LatLng } from './common';

export interface VulnerabilityProfile {
  citizenId: string;
  hasMedicalCondition: boolean;
  medicalDetails: string | null;
  hasMobilityImpairment: boolean;
  isElderly: boolean;
  hasChildren: boolean;
  numberOfDependents: number;
  requiresSpecialAssistance: boolean;
  specialAssistanceDetails: string | null;
}

export interface Citizen {
  id: string;
  name: string;
  phone?: string;
  location: LatLng | null;
  locationPermissionGranted: boolean;
  vulnerabilityProfile: VulnerabilityProfile | null;
  evacuationStatus: 'safe' | 'evacuating' | 'at_shelter' | 'needs_help' | 'unknown';
}
