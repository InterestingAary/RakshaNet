import type { LatLng } from './common';

export interface PriorityCase {
  id: string;
  citizenId?: string;
  name: string;
  location: LatLng;
  address: string;
  priorityLevel: 1 | 2 | 3 | 4;
  priorityLabel: 'Critical' | 'High' | 'Elevated' | 'Standard';
  vulnerabilityReason: string;
  medicalRequirement: string | null;
  mobilityRequirement: string | null;
  evacuationStatus: 'pending' | 'in_progress' | 'evacuated' | 'at_shelter';
  assignedTeamId: string | null;
  aiPriorityScore: number;
  aiPriorityRationale: string;
  reportedAt: Date;
  updatedAt: Date;
}
