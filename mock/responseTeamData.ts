import type { ResponseTeam } from '../types/response';

const now = new Date('2026-08-26T14:00:00+05:30');
const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
const twentyMinAgo = new Date(now.getTime() - 20 * 60 * 1000);
const fifteenMinAgo = new Date(now.getTime() - 15 * 60 * 1000);
const tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000);
const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
const twoMinAgo = new Date(now.getTime() - 2 * 60 * 1000);

export const MOCK_RESPONSE_TEAMS: ResponseTeam[] = [
  {
    id: 'team-001',
    name: 'NDRF Team 01',
    type: 'rescue',
    location: { lat: 16.5075, lng: 80.6328 },
    status: 'available',
    assignedIncidentId: null,
    assignedPriorityCaseId: 'priority-001',
    contactPhone: '+91-866-2551001',
    memberCount: 12,
    updatedAt: thirtyMinAgo,
  },
  {
    id: 'team-002',
    name: 'Medical Response Unit 01',
    type: 'medical',
    location: { lat: 16.5088, lng: 80.6512 },
    status: 'assigned',
    assignedIncidentId: 'incident-003',
    assignedPriorityCaseId: 'priority-005',
    contactPhone: '+91-866-2551002',
    memberCount: 6,
    updatedAt: twentyMinAgo,
  },
  {
    id: 'team-003',
    name: 'Vijayawada Police Unit 03',
    type: 'police',
    location: { lat: 16.5045, lng: 80.6310 },
    status: 'enroute',
    assignedIncidentId: 'incident-006',
    assignedPriorityCaseId: null,
    contactPhone: '+91-866-2551003',
    memberCount: 8,
    updatedAt: tenMinAgo,
  },
  {
    id: 'team-004',
    name: 'Fire & Emergency Services 02',
    type: 'fire',
    location: { lat: 16.5210, lng: 80.6400 },
    status: 'available',
    assignedIncidentId: null,
    assignedPriorityCaseId: null,
    contactPhone: '+91-866-2551004',
    memberCount: 10,
    updatedAt: fiveMinAgo,
  },
  {
    id: 'team-005',
    name: 'NGO Relief Team Alpha',
    type: 'ngo',
    location: { lat: 16.5062, lng: 80.6480 },
    status: 'on_scene',
    assignedIncidentId: null,
    assignedPriorityCaseId: 'priority-010',
    contactPhone: '+91-866-2551005',
    memberCount: 15,
    updatedAt: fifteenMinAgo,
  },
  {
    id: 'team-006',
    name: 'Volunteer Group 07',
    type: 'volunteer',
    location: { lat: 16.5150, lng: 80.6320 },
    status: 'available',
    assignedIncidentId: null,
    assignedPriorityCaseId: null,
    contactPhone: '+91-866-2551006',
    memberCount: 20,
    updatedAt: twoMinAgo,
  },
];
