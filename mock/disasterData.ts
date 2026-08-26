import type { DisasterEvent, HazardZone } from '../types/disaster';
import type { Alert } from '../types/alert';
import type { TimelineEvent } from '../types/timeline';

const now = new Date('2026-08-26T14:00:00+05:30');
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
const ninetyMinAgo = new Date(now.getTime() - 90 * 60 * 1000);
const seventyFiveMinAgo = new Date(now.getTime() - 75 * 60 * 1000);
const sixtyMinAgo = new Date(now.getTime() - 60 * 60 * 1000);
const fiftyMinAgo = new Date(now.getTime() - 50 * 60 * 1000);
const fortyFiveMinAgo = new Date(now.getTime() - 45 * 60 * 1000);
const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
const twentyMinAgo = new Date(now.getTime() - 20 * 60 * 1000);
const fifteenMinAgo = new Date(now.getTime() - 15 * 60 * 1000);
const tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000);
const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
const twoMinAgo = new Date(now.getTime() - 2 * 60 * 1000);
const in6Hours = new Date(now.getTime() + 6 * 60 * 60 * 1000);
const in12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000);

export const MOCK_DISASTER_EVENT: DisasterEvent = {
  id: 'disaster-001',
  name: 'Krishna River Flood — Vijayawada 2026',
  type: 'flood',
  severity: 'critical',
  affectedArea: {
    north: 16.5400,
    south: 16.4600,
    east: 80.7000,
    west: 80.5900,
  },
  description:
    'Severe flooding caused by excess water release from Prakasam Barrage and incessant rainfall. ' +
    'Krishna River has breached danger level at 48.5 ft. Low-lying areas of Vijayawada including ' +
    'Ibrahimpatnam, Krishnalanka, Pathammokku and riverside wards are severely affected.',
  startTime: twoHoursAgo,
  status: 'active',
  instructions:
    'Evacuate immediately if in flood-prone zones. Do not attempt to cross flooded roads. ' +
    'Move to designated shelters. Call 1077 for emergency assistance. Follow authority instructions.',
  affectedPopulation: 45000,
  createdBy: 'auth-001',
  updatedAt: fiveMinAgo,
};

export const MOCK_HAZARD_ZONES: HazardZone[] = [
  {
    id: 'hazard-001',
    disasterEventId: 'disaster-001',
    name: 'Flood Zone A — Krishna River Banks',
    severity: 'critical',
    polygon: [
      { lat: 16.5200, lng: 80.6200 },
      { lat: 16.5200, lng: 80.6500 },
      { lat: 16.5050, lng: 80.6500 },
      { lat: 16.5000, lng: 80.6350 },
      { lat: 16.5050, lng: 80.6200 },
    ],
    type: 'flood',
    description:
      'Primary flood zone along the Krishna River banks. Water level has breached 48.5 ft. ' +
      'Immediate evacuation mandatory. All roads in this zone are submerged.',
    updatedAt: fiveMinAgo,
  },
  {
    id: 'hazard-002',
    disasterEventId: 'disaster-001',
    name: 'Flood Zone B — Low-lying Urban Areas',
    severity: 'high',
    polygon: [
      { lat: 16.5100, lng: 80.6450 },
      { lat: 16.5150, lng: 80.6600 },
      { lat: 16.5000, lng: 80.6700 },
      { lat: 16.4950, lng: 80.6550 },
      { lat: 16.5000, lng: 80.6450 },
    ],
    type: 'flood',
    description:
      'Low-lying urban residential areas facing 3-4 ft water accumulation. ' +
      'Ground floors are inundated. Residents should move to upper floors or evacuate.',
    updatedAt: tenMinAgo,
  },
  {
    id: 'hazard-003',
    disasterEventId: 'disaster-001',
    name: 'Flood Zone C — Potential Overflow Risk',
    severity: 'medium',
    polygon: [
      { lat: 16.5250, lng: 80.6550 },
      { lat: 16.5300, lng: 80.6700 },
      { lat: 16.5150, lng: 80.6800 },
      { lat: 16.5100, lng: 80.6650 },
      { lat: 16.5200, lng: 80.6550 },
    ],
    type: 'flood',
    description:
      'Areas at risk of overflow if rainfall continues at current rate. ' +
      'Residents should prepare go-bags and stay alert for evacuation orders.',
    updatedAt: twentyMinAgo,
  },
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'alert-001',
    type: 'official_warning',
    title: 'Red Alert: Immediate Flood Evacuation Order',
    message:
      'The District Collector of Krishna District has issued a mandatory evacuation order for all ' +
      'residents in Flood Zones A and B. Krishna River water level is at 48.5 ft and rising. ' +
      'Prakasam Barrage is releasing 6.5 lakh cusecs. All residents must vacate to designated shelters immediately.',
    severity: 'critical',
    affectedArea: {
      north: 16.5400,
      south: 16.4600,
      east: 80.7000,
      west: 80.5900,
    },
    source: 'District Collector, Krishna District',
    issuedAt: twoHoursAgo,
    expiresAt: null,
    actionRequired: 'Evacuate to nearest designated shelter immediately. Do not delay.',
    disasterEventId: 'disaster-001',
  },
  {
    id: 'alert-002',
    type: 'system_recommendation',
    title: 'AI System: Route Recalculation — NH-16 Flooded',
    message:
      'The AI routing engine has detected that NH-16 near Krishnalanka is flooded and impassable. ' +
      'All evacuation routes through this segment have been recalculated. Citizens are advised to use ' +
      'Bandar Road via Governorpet as the primary evacuation corridor.',
    severity: 'high',
    affectedArea: {
      north: 16.5200,
      south: 16.4900,
      east: 80.6700,
      west: 80.6200,
    },
    source: 'SIH26191 Adaptive Routing Engine',
    issuedAt: thirtyMinAgo,
    expiresAt: in6Hours,
    actionRequired: 'Use alternative routes. Avoid NH-16 near Krishnalanka.',
    disasterEventId: 'disaster-001',
  },
  {
    id: 'alert-003',
    type: 'citizen_report',
    title: 'Citizen Report: MG Road Bridge Approach Flooded',
    message:
      'Multiple citizens have reported that the approach road to MG Road bridge near Siddhartha Nagar is ' +
      'flooded with 2 ft of water. Vehicles attempting to cross are stalling. Alternate route via ' +
      'Eluru Road recommended.',
    severity: 'medium',
    affectedArea: null,
    source: 'Citizen Reports (verified by authority)',
    issuedAt: fifteenMinAgo,
    expiresAt: in12Hours,
    actionRequired: 'Avoid MG Road bridge approach. Use Eluru Road.',
    disasterEventId: 'disaster-001',
  },
];

export const MOCK_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'tl-001',
    timestamp: twoHoursAgo,
    type: 'event_created',
    title: 'Flood Emergency Declared',
    description:
      'District Collector declared flood emergency for Vijayawada. Krishna River water level at 47.2 ft. ' +
      'Emergency operations centre activated at Collectorate.',
    severity: 'critical',
    relatedEntityId: 'disaster-001',
    relatedEntityType: 'DisasterEvent',
  },
  {
    id: 'tl-002',
    timestamp: new Date(twoHoursAgo.getTime() + 5 * 60 * 1000),
    type: 'alert_issued',
    title: 'Red Alert Issued',
    description: 'Mandatory evacuation order issued for Flood Zones A and B by District Collector.',
    severity: 'critical',
    relatedEntityId: 'alert-001',
    relatedEntityType: 'Alert',
  },
  {
    id: 'tl-003',
    timestamp: ninetyMinAgo,
    type: 'shelter_activated',
    title: 'Vijayawada Municipal School Shelter Activated',
    description:
      'Municipal School at Governorpet activated as primary shelter. Capacity: 500. ' +
      'Medical team deployed on-site.',
    severity: 'low',
    relatedEntityId: 'shelter-001',
    relatedEntityType: 'Shelter',
  },
  {
    id: 'tl-004',
    timestamp: ninetyMinAgo,
    type: 'shelter_activated',
    title: 'IG Municipal Stadium Shelter Activated',
    description:
      'Indira Gandhi Municipal Stadium activated as large-capacity shelter. Capacity: 2000. ' +
      'NGO Relief Team Alpha deployed.',
    severity: 'low',
    relatedEntityId: 'shelter-002',
    relatedEntityType: 'Shelter',
  },
  {
    id: 'tl-005',
    timestamp: seventyFiveMinAgo,
    type: 'priority_identified',
    title: 'AI Triage: 3 Critical Cases Identified',
    description:
      'AI priority engine identified 3 critical-level cases requiring immediate rescue: ' +
      '1 elderly medical case (cardiac), 1 mobility-impaired resident, 1 infant with single parent. ' +
      'NDRF Team 01 and Medical Response Unit 01 alerted.',
    severity: 'critical',
    relatedEntityId: 'priority-001',
    relatedEntityType: 'PriorityCase',
  },
  {
    id: 'tl-006',
    timestamp: sixtyMinAgo,
    type: 'shelter_activated',
    title: 'Government Community Hall Shelter Activated',
    description:
      'Community Hall at Patamata activated. Capacity: 300. Vijayawada Police Unit 03 assigned for security.',
    severity: 'low',
    relatedEntityId: 'shelter-003',
    relatedEntityType: 'Shelter',
  },
  {
    id: 'tl-007',
    timestamp: fiftyMinAgo,
    type: 'route_blocked',
    title: 'Route Blocked: NH-16 Near Krishnalanka',
    description:
      'NH-16 near Krishnalanka reported flooded and impassable. 3 evacuation routes affected. ' +
      'System initiating route recalculation.',
    severity: 'high',
    relatedEntityId: 'route-002',
    relatedEntityType: 'EvacuationRoute',
  },
  {
    id: 'tl-008',
    timestamp: fortyFiveMinAgo,
    type: 'route_recalculated',
    title: 'Route Recalculated: Bandar Road Corridor',
    description:
      'AI routing engine recalculated 3 blocked routes. New primary corridor via Bandar Road — ' +
      'Governorpet is safe and operational. All active navigations updated.',
    severity: 'medium',
    relatedEntityId: 'route-001',
    relatedEntityType: 'EvacuationRoute',
  },
  {
    id: 'tl-009',
    timestamp: thirtyMinAgo,
    type: 'team_assigned',
    title: 'NDRF Team 01 Assigned to Critical Case',
    description:
      'NDRF Team 01 (12 members) assigned to rescue elderly cardiac patient at Krishnalanka. ' +
      'ETA: 8 minutes.',
    severity: 'critical',
    relatedEntityId: 'team-001',
    relatedEntityType: 'ResponseTeam',
  },
  {
    id: 'tl-010',
    timestamp: twentyMinAgo,
    type: 'capacity_update',
    title: 'IG Stadium Shelter 82% Full',
    description:
      'IG Municipal Stadium shelter has reached 82% capacity (1650/2000). ' +
      'Incoming evacuees are now being redirected to Municipal School shelter.',
    severity: 'medium',
    relatedEntityId: 'shelter-002',
    relatedEntityType: 'Shelter',
  },
  {
    id: 'tl-011',
    timestamp: fifteenMinAgo,
    type: 'incident_reported',
    title: 'Incident: Trapped Person Reported at Rajiv Nagar',
    description:
      'Citizen report of person trapped on rooftop at Rajiv Nagar, Flood Zone A. ' +
      'Incident marked critical. Rescue team being dispatched.',
    severity: 'critical',
    relatedEntityId: 'incident-006',
    relatedEntityType: 'IncidentReport',
  },
  {
    id: 'tl-012',
    timestamp: tenMinAgo,
    type: 'incident_assigned',
    title: 'Rescue Team Assigned to Trapped Person',
    description:
      'Vijayawada Police Unit 03 en route to trapped person at Rajiv Nagar. ' +
      'Medical Response Unit 01 placed on standby.',
    severity: 'high',
    relatedEntityId: 'incident-006',
    relatedEntityType: 'IncidentReport',
  },
  {
    id: 'tl-013',
    timestamp: fiveMinAgo,
    type: 'evacuation_update',
    title: 'Evacuation Progress: 12,400 Residents Relocated',
    description:
      'Approximately 12,400 residents have been successfully evacuated to shelters. ' +
      '6 response teams operational. 4 High-priority cases are in-progress.',
    severity: 'medium',
    relatedEntityId: 'disaster-001',
    relatedEntityType: 'DisasterEvent',
  },
  {
    id: 'tl-014',
    timestamp: twoMinAgo,
    type: 'shelter_activated',
    title: 'SV Municipal Hospital Shelter Capacity Nearing Limit',
    description:
      'SV Municipal Hospital shelter at 86% capacity (130/150). Medical cases only accepted. ' +
      'Non-medical cases redirected to Municipal School.',
    severity: 'high',
    relatedEntityId: 'shelter-004',
    relatedEntityType: 'Shelter',
  },
];
