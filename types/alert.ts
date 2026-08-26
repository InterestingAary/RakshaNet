import type { Severity, BoundingBox } from './common';

export interface Alert {
  id: string;
  type: 'official_warning' | 'system_recommendation' | 'citizen_report';
  title: string;
  message: string;
  severity: Severity;
  affectedArea: BoundingBox | null;
  source: string;
  issuedAt: Date;
  expiresAt: Date | null;
  actionRequired: string | null;
  disasterEventId: string;
}
