export type BlockageType =
  | 'FLOODED'
  | 'DEBRIS'
  | 'COLLAPSED'
  | 'TREE_FALL'
  | 'INFRASTRUCTURE_DAMAGE'
  | 'OTHER';

export type BlockageSeverity = 'PARTIAL' | 'FULL_CLOSURE' | 'IMPASSABLE';

export type BlockedRoadStatus =
  | 'REPORTED'
  | 'VERIFIED'
  | 'REJECTED'
  | 'CLEARED';

export interface BlockedRoad {
  id: string;
  disaster_id?: string | null;
  road_name: string;
  description: string;
  blockage_type: BlockageType | string;
  severity: BlockageSeverity | string;
  status: BlockedRoadStatus | string;
  verified: boolean;
  latitude: number;
  longitude: number;
  reported_by_id?: string | null;
  verified_by_id?: string | null;
  verified_at?: string | null;
  cleared_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlockedRoadReportInput {
  road_name: string;
  description: string;
  latitude: number;
  longitude: number;
  blockage_type?: BlockageType | string;
  severity?: BlockageSeverity | string;
  disaster_id?: string | null;
}

export interface BlockedRoadAuditLog {
  id: string;
  blocked_road_id: string;
  action: 'CREATED' | 'VERIFIED' | 'REJECTED' | 'CLEARED' | 'UPDATED' | 'DELETED' | string;
  changed_by_id: string;
  previous_status: BlockedRoadStatus | string | null;
  new_status: BlockedRoadStatus | string;
  notes?: string | null;
  created_at: string;
}
