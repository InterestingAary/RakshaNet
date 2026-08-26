import type { IncidentReport } from '../types/incident';

const now = new Date('2026-08-26T14:00:00+05:30');
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
const ninetyMinAgo = new Date(now.getTime() - 90 * 60 * 1000);
const sixtyMinAgo = new Date(now.getTime() - 60 * 60 * 1000);
const fortyFiveMinAgo = new Date(now.getTime() - 45 * 60 * 1000);
const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
const twentyMinAgo = new Date(now.getTime() - 20 * 60 * 1000);
const fifteenMinAgo = new Date(now.getTime() - 15 * 60 * 1000);
const tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000);
const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);

export const MOCK_INCIDENTS: IncidentReport[] = [
  // ── New Road Blocked Reports ─────────────────────────────────────────────────
  {
    id: 'incident-001',
    type: 'road_blocked',
    location: { lat: 16.5050, lng: 80.6420 },
    address: 'Eluru Road near Benz Circle Junction, Vijayawada',
    description:
      'Large section of Eluru Road near Benz Circle junction is flooded and blocked. ' +
      'Approximately 50m of road under 1.5 ft water. Multiple vehicles stranded.',
    imageUrl: null,
    videoUrl: null,
    reportedBy: 'citizen',
    reporterName: 'Raju Krishnamurthy',
    status: 'new',
    severity: 'high',
    assignedTeamId: null,
    affectsRouteId: 'route-001',
    reportedAt: tenMinAgo,
    updatedAt: tenMinAgo,
  },
  {
    id: 'incident-002',
    type: 'road_blocked',
    location: { lat: 16.5130, lng: 80.6270 },
    address: 'Bandar Road near Rajiv Gandhi Park, Vijayawada',
    description:
      'Fallen tree blocking two lanes of Bandar Road near Rajiv Gandhi Park. ' +
      'Traffic completely halted. Tree fell due to strong winds accompanying the flood event.',
    imageUrl: null,
    videoUrl: null,
    reportedBy: 'citizen',
    reporterName: 'Padmavathi Rao',
    status: 'new',
    severity: 'medium',
    assignedTeamId: null,
    affectsRouteId: null,
    reportedAt: fiveMinAgo,
    updatedAt: fiveMinAgo,
  },

  // ── Medical Emergency (Assigned) ─────────────────────────────────────────────
  {
    id: 'incident-003',
    type: 'medical_emergency',
    location: { lat: 16.5075, lng: 80.6328 },
    address: '14-3-22, Krishnalanka, Vijayawada 520013',
    description:
      'Elderly male (approx. 75 years) reporting chest pain and difficulty breathing. ' +
      'Unable to evacuate independently. Requires immediate medical attention and evacuation.',
    imageUrl: null,
    videoUrl: null,
    reportedBy: 'citizen',
    reporterName: 'Neighbour — Sita Devi',
    status: 'assigned',
    severity: 'critical',
    assignedTeamId: 'team-002',
    affectsRouteId: null,
    reportedAt: ninetyMinAgo,
    updatedAt: thirtyMinAgo,
  },

  // ── Flooded Route Reports ────────────────────────────────────────────────────
  {
    id: 'incident-004',
    type: 'flooded_route',
    location: { lat: 16.5010, lng: 80.6350 },
    address: 'NH-16 near Krishnalanka Flyover, Vijayawada',
    description:
      'NH-16 approaching Krishnalanka flyover completely flooded. Water level at 3 ft. ' +
      'Road is impassable to all vehicles. Citizens are wading through dangerous waters.',
    imageUrl: null,
    videoUrl: null,
    reportedBy: 'authority',
    reporterName: 'Traffic Control, Vijayawada City',
    status: 'critical',
    severity: 'critical',
    assignedTeamId: 'team-003',
    affectsRouteId: 'route-002',
    reportedAt: fortyFiveMinAgo,
    updatedAt: twentyMinAgo,
  },
  {
    id: 'incident-005',
    type: 'flooded_route',
    location: { lat: 16.5200, lng: 80.6500 },
    address: 'MG Road Bridge Approach, Siddhartha Nagar, Vijayawada',
    description:
      'MG Road bridge approach road flooded with 2 ft water. Resolved after traffic was diverted. ' +
      'Bridge approach is now draining.',
    imageUrl: null,
    videoUrl: null,
    reportedBy: 'citizen',
    reporterName: 'Suresh Babu',
    status: 'resolved',
    severity: 'medium',
    assignedTeamId: 'team-003',
    affectsRouteId: null,
    reportedAt: sixtyMinAgo,
    updatedAt: thirtyMinAgo,
  },

  // ── Fallen Tree (Reviewing) ──────────────────────────────────────────────────
  {
    id: 'incident-006-fallen',
    type: 'fallen_tree',
    location: { lat: 16.5165, lng: 80.6610 },
    address: 'Patamata Main Road near Kali Temple, Vijayawada',
    description:
      'Large banyan tree has fallen across Patamata Main Road. Partially blocking both lanes. ' +
      'No injuries reported. Power lines may be affected. Awaiting BESCOM inspection.',
    imageUrl: null,
    videoUrl: null,
    reportedBy: 'citizen',
    reporterName: 'Venugopal Sharma',
    status: 'reviewing',
    severity: 'medium',
    assignedTeamId: null,
    affectsRouteId: 'route-003',
    reportedAt: thirtyMinAgo,
    updatedAt: twentyMinAgo,
  },

  // ── Trapped Person (Critical, Assigned) ─────────────────────────────────────
  {
    id: 'incident-006',
    type: 'trapped',
    location: { lat: 16.5040, lng: 80.6295 },
    address: '33-2-7, Rajiv Nagar, Krishnalanka, Vijayawada 520013',
    description:
      'Person trapped on rooftop of 3-storey residential building. Ground and first floors completely ' +
      'inundated. Individual signalling for help. Has been stranded for over 1 hour.',
    imageUrl: null,
    videoUrl: null,
    reportedBy: 'citizen',
    reporterName: 'Anonymous (SOS Signal)',
    status: 'assigned',
    severity: 'critical',
    assignedTeamId: 'team-003',
    affectsRouteId: null,
    reportedAt: fifteenMinAgo,
    updatedAt: tenMinAgo,
  },

  // ── Fire (Resolved) ──────────────────────────────────────────────────────────
  {
    id: 'incident-007',
    type: 'fire',
    location: { lat: 16.5260, lng: 80.6420 },
    address: '5-1-23, One Town, Vijayawada 520001',
    description:
      'Small fire reported at residential property, likely due to short circuit from flood water. ' +
      'Fire contained and extinguished by Fire & Emergency Services. No injuries. Building evacuated.',
    imageUrl: null,
    videoUrl: null,
    reportedBy: 'citizen',
    reporterName: 'Kamala Prasad',
    status: 'resolved',
    severity: 'high',
    assignedTeamId: 'team-004',
    affectsRouteId: null,
    reportedAt: twoHoursAgo,
    updatedAt: ninetyMinAgo,
  },
  {
    id: 'incident-008',
    type: 'road_blocked',
    location: { lat: 16.5190, lng: 80.6350 },
    address: 'Siddhartha College Road, Governorpet, Vijayawada',
    description:
      'Massive debris flow blocking Siddhartha College Road. Mud and garbage washed by floodwaters. ' +
      'Road completely impassable. Affects access to Municipal School shelter.',
    imageUrl: null,
    videoUrl: null,
    reportedBy: 'authority',
    reporterName: 'Vijayawada Municipal Corporation — Roads Dept.',
    status: 'new',
    severity: 'high',
    assignedTeamId: null,
    affectsRouteId: 'route-001',
    reportedAt: fiveMinAgo,
    updatedAt: fiveMinAgo,
  },
];
