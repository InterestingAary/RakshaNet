import type { PriorityCase } from '../types/priority';

const now = new Date('2026-08-26T14:00:00+05:30');
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
const ninetyMinAgo = new Date(now.getTime() - 90 * 60 * 1000);
const seventyFiveMinAgo = new Date(now.getTime() - 75 * 60 * 1000);
const sixtyMinAgo = new Date(now.getTime() - 60 * 60 * 1000);
const fortyFiveMinAgo = new Date(now.getTime() - 45 * 60 * 1000);
const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
const twentyMinAgo = new Date(now.getTime() - 20 * 60 * 1000);
const fifteenMinAgo = new Date(now.getTime() - 15 * 60 * 1000);
const tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000);
const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
const twoMinAgo = new Date(now.getTime() - 2 * 60 * 1000);

export const MOCK_PRIORITY_CASES: PriorityCase[] = [
  // ── Critical (Level 1) ──────────────────────────────────────────────────────
  {
    id: 'priority-001',
    citizenId: 'citizen-101',
    name: 'Venkata Rao Naidu',
    location: { lat: 16.5075, lng: 80.6328 },
    address: '14-3-22, Krishnalanka, Vijayawada 520013',
    priorityLevel: 1,
    priorityLabel: 'Critical',
    vulnerabilityReason: 'Elderly male, cardiac condition, lives alone, ground-floor in Flood Zone A',
    medicalRequirement: 'Cardiac medications required. Portable oxygen may be needed. Avoid exertion.',
    mobilityRequirement: null,
    evacuationStatus: 'in_progress',
    assignedTeamId: 'team-001',
    aiPriorityScore: 97,
    aiPriorityRationale:
      'Score 97/100: Elderly (75+), active cardiac condition, single occupant, ground-floor residence ' +
      'in critical flood zone with water level rising at 0.3 ft/hour. Medical evacuation required.',
    reportedAt: seventyFiveMinAgo,
    updatedAt: thirtyMinAgo,
  },
  {
    id: 'priority-002',
    citizenId: 'citizen-102',
    name: 'Lakshmi Devi',
    location: { lat: 16.5102, lng: 80.6445 },
    address: '8-1-56, Ibrahimpatnam, Vijayawada 520010',
    priorityLevel: 1,
    priorityLabel: 'Critical',
    vulnerabilityReason: 'Mobility-impaired resident, uses wheelchair, cannot self-evacuate, Flood Zone A',
    medicalRequirement: null,
    mobilityRequirement: 'Requires wheelchair-accessible vehicle and assistance of 2 persons to transfer.',
    evacuationStatus: 'pending',
    assignedTeamId: 'team-001',
    aiPriorityScore: 95,
    aiPriorityRationale:
      'Score 95/100: Permanent wheelchair user, cannot self-evacuate, located in critical flood zone. ' +
      'Requires specialised vehicle. Water ingress reported in building.',
    reportedAt: seventyFiveMinAgo,
    updatedAt: twentyMinAgo,
  },
  {
    id: 'priority-003',
    citizenId: 'citizen-103',
    name: 'Priya Sharma (with infant)',
    location: { lat: 16.5048, lng: 80.6372 },
    address: '22-7-11, Pathammokku, Vijayawada 520013',
    priorityLevel: 1,
    priorityLabel: 'Critical',
    vulnerabilityReason: 'Single mother with 4-month-old infant, ground floor, Flood Zone A, no vehicle',
    medicalRequirement: 'Infant requires dry/warm environment. Formula feed supplies needed.',
    mobilityRequirement: null,
    evacuationStatus: 'pending',
    assignedTeamId: null,
    aiPriorityScore: 93,
    aiPriorityRationale:
      'Score 93/100: Single parent with infant under 6 months, ground-floor property with active water ' +
      'ingress, no private transport, located in critical flood zone.',
    reportedAt: sixtyMinAgo,
    updatedAt: tenMinAgo,
  },

  // ── High (Level 2) ──────────────────────────────────────────────────────────
  {
    id: 'priority-004',
    citizenId: 'citizen-104',
    name: 'Subbaiah Chetty',
    location: { lat: 16.5135, lng: 80.6490 },
    address: '6-2-34, Bandar Road, Vijayawada 520001',
    priorityLevel: 2,
    priorityLabel: 'High',
    vulnerabilityReason: 'Elderly resident (78), lives alone, first floor, Flood Zone B',
    medicalRequirement: 'Diabetic — insulin requires refrigeration.',
    mobilityRequirement: 'Slow mobility — requires assistance on stairs.',
    evacuationStatus: 'pending',
    assignedTeamId: null,
    aiPriorityScore: 84,
    aiPriorityRationale:
      'Score 84/100: Elderly, diabetic requiring refrigerated medication, limited mobility, ' +
      'first-floor property in high-severity flood zone.',
    reportedAt: sixtyMinAgo,
    updatedAt: fifteenMinAgo,
  },
  {
    id: 'priority-005',
    citizenId: 'citizen-105',
    name: 'Ananya Reddy',
    location: { lat: 16.5088, lng: 80.6512 },
    address: '3-4-78, Suryaraopet, Vijayawada 520002',
    priorityLevel: 2,
    priorityLabel: 'High',
    vulnerabilityReason: 'Pregnant woman (32 weeks), husband deployed on duty, lives on ground floor',
    medicalRequirement: 'High-risk pregnancy. Requires close monitoring. Pre-term risk elevated.',
    mobilityRequirement: null,
    evacuationStatus: 'in_progress',
    assignedTeamId: 'team-002',
    aiPriorityScore: 81,
    aiPriorityRationale:
      'Score 81/100: Pregnant (32 weeks), high-risk classification, sole adult in household, ' +
      'ground-floor in Flood Zone B.',
    reportedAt: fortyFiveMinAgo,
    updatedAt: twentyMinAgo,
  },
  {
    id: 'priority-006',
    citizenId: 'citizen-106',
    name: 'Ramanaiah Pillai',
    location: { lat: 16.5200, lng: 80.6410 },
    address: '11-5-12, One Town, Vijayawada 520001',
    priorityLevel: 2,
    priorityLabel: 'High',
    vulnerabilityReason: 'Elderly couple (both 70+), both have chronic conditions, second floor',
    medicalRequirement: 'Hypertension and COPD. Stress must be minimised during evacuation.',
    mobilityRequirement: 'Both require assistance on stairs.',
    evacuationStatus: 'pending',
    assignedTeamId: null,
    aiPriorityScore: 78,
    aiPriorityRationale:
      'Score 78/100: Elderly couple with multiple chronic conditions, limited mobility, ' +
      'second floor but building in high-risk zone with structural concerns.',
    reportedAt: sixtyMinAgo,
    updatedAt: tenMinAgo,
  },
  {
    id: 'priority-007',
    citizenId: 'citizen-107',
    name: 'Nagamani Rao',
    location: { lat: 16.5165, lng: 80.6555 },
    address: '19-1-4, Benz Circle, Vijayawada 520010',
    priorityLevel: 2,
    priorityLabel: 'High',
    vulnerabilityReason: 'Bedridden patient (post-surgery), 3 dependents, no vehicle',
    medicalRequirement: 'Recent abdominal surgery. Cannot be moved without stretcher. Wound care needed.',
    mobilityRequirement: 'Requires stretcher and 3 trained personnel for safe transfer.',
    evacuationStatus: 'pending',
    assignedTeamId: null,
    aiPriorityScore: 76,
    aiPriorityRationale:
      'Score 76/100: Post-surgical bedridden patient, requires specialised evacuation equipment, ' +
      '3 dependents, located in high-severity flood zone.',
    reportedAt: thirtyMinAgo,
    updatedAt: fiveMinAgo,
  },

  // ── Elevated (Level 3) ──────────────────────────────────────────────────────
  {
    id: 'priority-008',
    citizenId: 'citizen-108',
    name: 'Srinivas Family (5 members)',
    location: { lat: 16.5240, lng: 80.6470 },
    address: '7-3-19, Labbipet, Vijayawada 520010',
    priorityLevel: 3,
    priorityLabel: 'Elevated',
    vulnerabilityReason: 'Family of 5 with 2 children under 5, no private transport',
    medicalRequirement: null,
    mobilityRequirement: null,
    evacuationStatus: 'pending',
    assignedTeamId: null,
    aiPriorityScore: 64,
    aiPriorityRationale:
      'Score 64/100: Family with young children, no transport, located in zone approaching flood risk. ' +
      'Pre-emptive evacuation recommended.',
    reportedAt: fortyFiveMinAgo,
    updatedAt: twentyMinAgo,
  },
  {
    id: 'priority-009',
    citizenId: 'citizen-109',
    name: 'Kumari Devamma',
    location: { lat: 16.5180, lng: 80.6590 },
    address: '5-8-33, Patamata, Vijayawada 520007',
    priorityLevel: 3,
    priorityLabel: 'Elevated',
    vulnerabilityReason: 'Widow with 3 school-age children, ground floor, Zone B boundary',
    medicalRequirement: null,
    mobilityRequirement: null,
    evacuationStatus: 'pending',
    assignedTeamId: null,
    aiPriorityScore: 61,
    aiPriorityRationale:
      'Score 61/100: Single-parent household with multiple dependents, ground-floor property ' +
      'at edge of high-severity zone.',
    reportedAt: thirtyMinAgo,
    updatedAt: fifteenMinAgo,
  },
  {
    id: 'priority-010',
    citizenId: 'citizen-110',
    name: 'Thomas & Family',
    location: { lat: 16.5290, lng: 80.6500 },
    address: '2-6-45, Moghalrajpuram, Vijayawada 520010',
    priorityLevel: 3,
    priorityLabel: 'Elevated',
    vulnerabilityReason: 'Family with specially-abled child (cerebral palsy), no vehicle',
    medicalRequirement: 'Child requires specialised wheelchair and equipment during transport.',
    mobilityRequirement: 'Specialised wheelchair transport needed.',
    evacuationStatus: 'at_shelter',
    assignedTeamId: 'team-005',
    aiPriorityScore: 68,
    aiPriorityRationale:
      'Score 68/100: Child with cerebral palsy requiring specialised transport, ' +
      'family in medium-risk zone with potential overflow risk.',
    reportedAt: ninetyMinAgo,
    updatedAt: twoMinAgo,
  },

  // ── Standard (Level 4) ──────────────────────────────────────────────────────
  {
    id: 'priority-011',
    citizenId: 'citizen-111',
    name: 'Mohammed Saleem',
    location: { lat: 16.5310, lng: 80.6600 },
    address: '10-2-67, Ramalingeswara Nagar, Vijayawada 520012',
    priorityLevel: 4,
    priorityLabel: 'Standard',
    vulnerabilityReason: 'Adult resident in Zone C boundary, no private transport',
    medicalRequirement: null,
    mobilityRequirement: null,
    evacuationStatus: 'evacuated',
    assignedTeamId: null,
    aiPriorityScore: 42,
    aiPriorityRationale:
      'Score 42/100: Healthy adult, no dependents, in low-risk zone. ' +
      'Standard evacuation advisory. Can use public transport corridors.',
    reportedAt: sixtyMinAgo,
    updatedAt: thirtyMinAgo,
  },
  {
    id: 'priority-012',
    citizenId: 'citizen-112',
    name: 'Vijaya Nirmala',
    location: { lat: 16.5350, lng: 80.6650 },
    address: '16-1-88, Auto Nagar, Vijayawada 520007',
    priorityLevel: 4,
    priorityLabel: 'Standard',
    vulnerabilityReason: 'Resident in precautionary zone, elderly family member (60) present',
    medicalRequirement: null,
    mobilityRequirement: null,
    evacuationStatus: 'evacuated',
    assignedTeamId: null,
    aiPriorityScore: 45,
    aiPriorityRationale:
      'Score 45/100: Household with elderly member (60) but zone risk is low-medium. ' +
      'Evacuation completed via own transport.',
    reportedAt: twoHoursAgo,
    updatedAt: fortyFiveMinAgo,
  },
];
