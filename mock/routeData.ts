import type { EvacuationRoute } from '../types/route';

const now = new Date('2026-08-26T14:00:00+05:30');
const fiftyMinAgo = new Date(now.getTime() - 50 * 60 * 1000);
const fortyFiveMinAgo = new Date(now.getTime() - 45 * 60 * 1000);
const tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000);

// Safe primary route: Central Vijayawada → Municipal School Shelter (Governorpet)
export const MOCK_EVACUATION_ROUTE: EvacuationRoute = {
  id: 'route-001',
  fromLocation: { lat: 16.5062, lng: 80.6480 },
  toShelterId: 'shelter-001',
  toShelterName: 'Vijayawada Municipal School',
  waypoints: [
    { lat: 16.5062, lng: 80.6480 }, // Start: Benz Circle
    { lat: 16.5080, lng: 80.6455 }, // Eluru Road turn
    { lat: 16.5095, lng: 80.6420 }, // Eluru Road continuing
    { lat: 16.5110, lng: 80.6390 }, // Eluru Road — safer elevated section
    { lat: 16.5128, lng: 80.6360 }, // Approach Governorpet
    { lat: 16.5140, lng: 80.6335 }, // Governorpet Main Road
    { lat: 16.5150, lng: 80.6320 }, // Destination: Municipal School
  ],
  status: 'safe',
  distanceKm: 3.2,
  estimatedTimeMin: 12,
  warnings: [],
  alternativeAvailable: true,
  calculatedAt: fortyFiveMinAgo,
};

// Blocked route: Central Vijayawada → Municipal School via NH-16
export const MOCK_BLOCKED_ROUTE: EvacuationRoute = {
  id: 'route-002',
  fromLocation: { lat: 16.5062, lng: 80.6480 },
  toShelterId: 'shelter-001',
  toShelterName: 'Vijayawada Municipal School',
  waypoints: [
    { lat: 16.5062, lng: 80.6480 }, // Start: Benz Circle
    { lat: 16.5040, lng: 80.6450 }, // NH-16 approach
    { lat: 16.5020, lng: 80.6410 }, // NH-16 — FLOODED SECTION
    { lat: 16.5010, lng: 80.6350 }, // NH-16 near Krishnalanka — BLOCKED
    { lat: 16.5020, lng: 80.6290 }, // Continuing NH-16
    { lat: 16.5060, lng: 80.6250 }, // Krishnalanka area
    { lat: 16.5100, lng: 80.6280 }, // Towards Governorpet
    { lat: 16.5150, lng: 80.6320 }, // Destination: Municipal School
  ],
  status: 'blocked',
  distanceKm: 4.8,
  estimatedTimeMin: 0,
  warnings: [
    {
      id: 'warning-001',
      routeId: 'route-002',
      location: { lat: 16.5010, lng: 80.6350 },
      type: 'flood',
      description:
        'NH-16 near Krishnalanka Flyover is completely flooded. Water level at 3 ft. ' +
        'Road is impassable to all vehicles including SUVs.',
      severity: 'critical',
    },
    {
      id: 'warning-002',
      routeId: 'route-002',
      location: { lat: 16.5020, lng: 80.6410 },
      type: 'blocked_road',
      description:
        'Road blocked by authorities due to flooding. Barricades erected 200m before flyover.',
      severity: 'high',
    },
  ],
  alternativeAvailable: true,
  calculatedAt: fiftyMinAgo,
};

// Alternative route: Central Vijayawada → Community Hall Shelter (Patamata)
export const MOCK_ALTERNATIVE_ROUTE: EvacuationRoute = {
  id: 'route-003',
  fromLocation: { lat: 16.5062, lng: 80.6480 },
  toShelterId: 'shelter-003',
  toShelterName: 'Government Community Hall — Patamata',
  waypoints: [
    { lat: 16.5062, lng: 80.6480 }, // Start: Benz Circle
    { lat: 16.5070, lng: 80.6510 }, // Head east on Ring Road
    { lat: 16.5060, lng: 80.6545 }, // Ring Road continuing
    { lat: 16.5040, lng: 80.6580 }, // Patamata Road turn
    { lat: 16.5020, lng: 80.6598 }, // Patamata Road
    { lat: 16.5008, lng: 80.6610 }, // Destination: Community Hall
  ],
  status: 'safe',
  distanceKm: 4.1,
  estimatedTimeMin: 15,
  warnings: [
    {
      id: 'warning-003',
      routeId: 'route-003',
      location: { lat: 16.5040, lng: 80.6580 },
      type: 'other',
      description:
        'Minor waterlogging on Patamata Road — passable with care. Avoid in heavy vehicles over 2 tons.',
      severity: 'low',
    },
  ],
  alternativeAvailable: false,
  calculatedAt: tenMinAgo,
};
