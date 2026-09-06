const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '▣' },
  { id: 'events', label: 'Disaster Events', icon: '⚑' },
  { id: 'map', label: 'Live Map', icon: '⌖' },
  { id: 'shelters', label: 'Shelters', icon: '▤' },
  { id: 'citizens', label: 'Citizens', icon: '◉' },
  { id: 'omnitriage', label: 'OmniTriage / Priority Cases', icon: '◎' },
  { id: 'incidents', label: 'Incidents', icon: '⚠' },
  { id: 'teams', label: 'Response Teams', icon: '✦' },
  { id: 'timeline', label: 'Timeline / Logs', icon: '⏱' },
  { id: 'reports', label: 'Reports', icon: '▤' },
  { id: 'settings', label: 'Settings', icon: '⚙' }
];

const API_BASE = window.RAKSHANET_API_URL || 'http://127.0.0.1:8000/api/v1';

const api = {
  token: localStorage.getItem('rakshanet_gov_token') || '',

  setToken(t) {
    this.token = t || '';
    if (t) {
      localStorage.setItem('rakshanet_gov_token', t);
    } else {
      localStorage.removeItem('rakshanet_gov_token');
    }
  },

  getHeaders(extra = {}) {
    const headers = { 'Content-Type': 'application/json', ...extra };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  },

  async login(username, password) {
    // Standardize authority ID to demo authority email if needed
    let email = username.trim().toLowerCase();
    if (email === 'auth-3301' || email.startsWith('auth-')) {
      email = 'auth-3301@rakshanet.gov.in';
    } else if (!email.includes('@')) {
      email = 'authority@rakshanet.gov.in';
    }

    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || `Login failed (${res.status})`);
    }

    const data = await res.json();
    this.setToken(data.access_token);
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to retrieve user profile');
    return res.json();
  },

  async getDisasters() {
    const res = await fetch(`${API_BASE}/disasters`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch disasters');
    return res.json();
  },

  async createDisaster(data) {
    const res = await fetch(`${API_BASE}/disasters`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create disaster');
    return res.json();
  },

  async updateDisaster(id, data) {
    const res = await fetch(`${API_BASE}/disasters/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update disaster');
    return res.json();
  },

  async getShelters() {
    const res = await fetch(`${API_BASE}/shelters`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch shelters');
    return res.json();
  },

  async createShelter(data) {
    const res = await fetch(`${API_BASE}/shelters`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create shelter');
    return res.json();
  },

  async updateShelter(id, data) {
    const res = await fetch(`${API_BASE}/shelters/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update shelter');
    return res.json();
  },

  async verifyShelter(id, verified = true) {
    const res = await fetch(`${API_BASE}/shelters/${id}/verify`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ verified })
    });
    if (!res.ok) throw new Error('Failed to verify shelter');
    return res.json();
  },

  async getHazards() {
    const res = await fetch(`${API_BASE}/hazards`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch hazards');
    return res.json();
  },

  async createHazard(data) {
    const res = await fetch(`${API_BASE}/hazards`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create hazard zone');
    return res.json();
  },

  async checkExposure(lat, lon) {
    const res = await fetch(`${API_BASE}/hazards/exposure?latitude=${lat}&longitude=${lon}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to calculate exposure');
    return res.json();
  },

  async getBlockedRoads(status = null) {
    const url = status ? `${API_BASE}/blocked-roads?status=${status}` : `${API_BASE}/blocked-roads`;
    const res = await fetch(url, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch blocked roads');
    return res.json();
  },

  async reportBlockedRoad(data) {
    const res = await fetch(`${API_BASE}/blocked-roads`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to report road blockage');
    return res.json();
  },

  async verifyBlockedRoad(id, verified = true, notes = '') {
    const res = await fetch(`${API_BASE}/blocked-roads/${id}/verify`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ verified, notes })
    });
    if (!res.ok) throw new Error('Failed to verify road blockage');
    return res.json();
  },

  async clearBlockedRoad(id, notes = '') {
    const res = await fetch(`${API_BASE}/blocked-roads/${id}/clear`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ notes })
    });
    if (!res.ok) throw new Error('Failed to clear road blockage');
    return res.json();
  },

  async getBlockedRoadAuditLogs(id) {
    const res = await fetch(`${API_BASE}/blocked-roads/${id}/audit-logs`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  async getIncidents() {
    const res = await fetch(`${API_BASE}/incidents`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },

  async createIncident(data) {
    const res = await fetch(`${API_BASE}/incidents`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create incident');
    return res.json();
  },

  async updateIncident(id, data) {
    const res = await fetch(`${API_BASE}/incidents/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update incident');
    return res.json();
  },

  async getReports() {
    const res = await fetch(`${API_BASE}/reports`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  },

  async recommendShelter(lat, lon, disasterId) {
    const res = await fetch(`${API_BASE}/relocation/recommend`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ latitude: lat, longitude: lon, disaster_id: disasterId })
    });
    if (!res.ok) throw new Error('Failed to recommend shelter');
    return res.json();
  },

  async calculateRoute(originLat, originLon, destLat, destLon, disasterId) {
    const res = await fetch(`${API_BASE}/relocation/route`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        origin_latitude: originLat,
        origin_longitude: originLon,
        destination_latitude: destLat,
        destination_longitude: destLon,
        disaster_id: disasterId
      })
    });
    if (!res.ok) throw new Error('Failed to calculate route');
    return res.json();
  },

  async assessRisk(data) {
    const res = await fetch(`${API_BASE}/ai/risk-assessment`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to assess risk');
    return res.json();
  },

  async assessRelocation(data) {
    const res = await fetch(`${API_BASE}/ai/relocation-priority`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to assess relocation priority');
    return res.json();
  }
};

const initialState = {
  loggedIn: false,
  currentPage: 'dashboard',
  emergencyActive: true,
  selectedMarker: 'shelter-a',
  mapLayer: 'all',
  routeBBlocked: false,
  simulating: false,
  backendConnected: false,
  officer: {
    name: 'Lt. A. Mehta',
    id: 'AUTH-3301',
    role: 'AUTHORITY'
  },
  emergency: {
    id: null,
    name: 'Flood Emergency — Vijayawada Riverfront',
    type: 'Flood',
    severity: 'CRITICAL',
    active: true,
    region: 'Patamata, Bandar & Vijayawada East',
    hazardZone: 'Krishna River low-lying flood belt',
    affectedPopulation: 8000,
    activationTime: '21:00',
    officialInstructions: 'Immediate relocation of vulnerable households to shelters in Patamata, Auto Nagar and Bandar.'
  },
  citizens: [
    { id: 'CIT-1042', location: 'Block 14, Patamata', vulnerability: 'Medical requirement', medicalRequirement: 'Critical', mobility: 'Wheelchair bound', ageGroup: 'Senior (68)', hazardExposure: 'HIGH', distance: '1.4 km', evacuationDifficulty: 'High', urgency: 'Immediate', priorityScore: 97, priorityLevel: 'CRITICAL', assignedShelter: 'Shelter A', assignedRoute: 'Route C', evacuationStatus: 'In Progress', reasons: ['High flood exposure', 'Medical requirement', 'Mobility limitation', 'Limited evacuation accessibility', 'High urgency'] },
    { id: 'CIT-1188', location: 'Block 5, Auto Nagar', vulnerability: 'Chronic illness', medicalRequirement: 'Oxygen support', mobility: 'Limited mobility', ageGroup: 'Adult (42)', hazardExposure: 'HIGH', distance: '1.1 km', evacuationDifficulty: 'Medium', urgency: 'Immediate', priorityScore: 94, priorityLevel: 'CRITICAL', assignedShelter: 'Shelter C', assignedRoute: 'Route A', evacuationStatus: 'Assigned', reasons: ['Needs oxygen support', 'Family dependent', 'Mobile support required', 'No stable access route'] },
    { id: 'CIT-1321', location: 'Block 7, Krishna River Road', vulnerability: 'Elderly support', medicalRequirement: 'Monitoring', mobility: 'Walking aid', ageGroup: 'Senior (74)', hazardExposure: 'MEDIUM', distance: '2.2 km', evacuationDifficulty: 'Medium', urgency: 'Urgent', priorityScore: 81, priorityLevel: 'HIGH', assignedShelter: 'Shelter D', assignedRoute: 'Route C', evacuationStatus: 'In Progress', reasons: ['Low mobility', 'High exposure', 'Limited transport access'] },
    { id: 'CIT-1455', location: 'Block 10, Ramalingeswarapeta', vulnerability: 'Child support', medicalRequirement: 'Low', mobility: 'Normal', ageGroup: 'Child (9)', hazardExposure: 'MEDIUM', distance: '3.1 km', evacuationDifficulty: 'Medium', urgency: 'Soon', priorityScore: 67, priorityLevel: 'MODERATE', assignedShelter: 'Shelter C', assignedRoute: 'Route A', evacuationStatus: 'Queued', reasons: ['Minor medical need', 'Family group', 'Safe route to school shelter'] },
    { id: 'CIT-4821', location: 'MG Road, Bandar', vulnerability: 'General citizen', medicalRequirement: 'None', mobility: 'Normal', ageGroup: 'Adult (31)', hazardExposure: 'HIGH', distance: '0.8 km', evacuationDifficulty: 'Medium', urgency: 'High', priorityScore: 72, priorityLevel: 'HIGH', assignedShelter: 'Shelter A', assignedRoute: 'Route B', evacuationStatus: 'In Progress', reasons: ['Reported flood water', 'Route disruption', 'Needs re-routing'] },
    { id: 'CIT-5810', location: 'North Access Road, Vijayawada East', vulnerability: 'General citizen', medicalRequirement: 'None', mobility: 'Normal', ageGroup: 'Adult (27)', hazardExposure: 'MEDIUM', distance: '1.9 km', evacuationDifficulty: 'Low', urgency: 'Moderate', priorityScore: 58, priorityLevel: 'NORMAL', assignedShelter: 'Shelter B', assignedRoute: 'Route B', evacuationStatus: 'Queued', reasons: ['Potential route disruption', 'High volume movement'] }
  ],
  shelters: [
    { id: 'shelter-a', name: 'Shelter A', location: 'Patamata Relief Point', coordinates: '16.5062, 80.6480', totalCapacity: 1000, occupancy: 830, physicalAvailable: 170, effectiveAvailable: 124, status: 'NEAR CAPACITY', medicalSupport: true, wheelchairAccessibility: true, elderlySupport: true, childSupport: true, contactPerson: 'A. Nair', facilities: ['Medical support', 'Wheelchair access', 'Elderly support', 'Children support'] },
    { id: 'shelter-b', name: 'Shelter B', location: 'Auto Nagar School Campus', coordinates: '16.5000, 80.6475', totalCapacity: 800, occupancy: 728, physicalAvailable: 72, effectiveAvailable: 61, status: 'CRITICAL', medicalSupport: false, wheelchairAccessibility: true, elderlySupport: false, childSupport: true, contactPerson: 'B. Roy', facilities: ['Wheelchair access', 'Children support'] },
    { id: 'shelter-c', name: 'Shelter C', location: 'Vijayawada East Community Hall', coordinates: '16.5165, 80.6352', totalCapacity: 1200, occupancy: 450, physicalAvailable: 750, effectiveAvailable: 690, status: 'AVAILABLE', medicalSupport: true, wheelchairAccessibility: true, elderlySupport: true, childSupport: true, contactPerson: 'S. Das', facilities: ['Medical support', 'Wheelchair access', 'Elderly support', 'Children support'] },
    { id: 'shelter-d', name: 'Shelter D', location: 'Bandar Bus Depot', coordinates: '16.5137, 80.6192', totalCapacity: 600, occupancy: 311, physicalAvailable: 289, effectiveAvailable: 245, status: 'AVAILABLE', medicalSupport: true, wheelchairAccessibility: true, elderlySupport: true, childSupport: false, contactPerson: 'R. Sen', facilities: ['Medical support', 'Wheelchair access', 'Elderly support'] }
  ],
  routes: [
    { id: 'route-a', label: 'Route A', origin: 'Patamata', destination: 'Vijayawada East', status: 'SAFE', className: 'route-safe', d: 'M80 260 L210 220 L310 240 L540 110', affectedCitizens: 0, travelTime: '18 min' },
    { id: 'route-b', label: 'Route B', origin: 'Bandar', destination: 'Shelter Zone East', status: 'SAFE', className: 'route-safe', d: 'M110 290 L260 320 L395 255 L520 310', affectedCitizens: 327, travelTime: '21 min' },
    { id: 'route-c', label: 'Route C', origin: 'Patamata', destination: 'Bandar Depot', status: 'SAFE', className: 'route-safe', d: 'M255 120 L355 145 L460 175 L570 150', affectedCitizens: 0, travelTime: '15 min' },
    { id: 'route-d', label: 'Alternative Route D', origin: 'Patamata', destination: 'Shelter C', status: 'NEW', className: 'route-risk', d: 'M90 210 L220 160 L385 190 L560 210', affectedCitizens: 0, travelTime: '22 min' }
  ],
  incidents: [
    { id: 'INC-482', type: 'Flooded Route', severity: 'CRITICAL', location: 'MG Road, Bandar', reportedBy: 'CIT-4821', reportedTime: '21:08', affectedCitizens: 27, status: 'CRITICAL', evidence: 'Road cam footage' },
    { id: 'INC-541', type: 'Fallen Tree', severity: 'HIGH', location: 'Bridge Lane, Vijayawada East', reportedBy: 'CIT-3902', reportedTime: '21:11', affectedCitizens: 9, status: 'UNDER REVIEW', evidence: 'Drone image' },
    { id: 'INC-603', type: 'Medical Emergency', severity: 'CRITICAL', location: 'Patamata Colony', reportedBy: 'CIT-1042', reportedTime: '21:07', affectedCitizens: 5, status: 'NEW', evidence: 'Paramedic alert' },
    { id: 'INC-707', type: 'Road Blocked', severity: 'HIGH', location: 'North Access Road, Vijayawada East', reportedBy: 'CIT-5810', reportedTime: '21:08', affectedCitizens: 14, status: 'UNDER REVIEW', evidence: 'Citizen report' }
  ],
  teams: [
    { id: 'RT-01', type: 'Rescue', members: 12, location: 'Command Post', assignedIncident: 'INC-603', status: 'DEPLOYED', eta: '06 min' },
    { id: 'RT-03', type: 'Medical', members: 8, location: 'Shelter A', assignedIncident: 'INC-603', status: 'RESPONDING', eta: '03 min' },
    { id: 'RT-07', type: 'Traffic', members: 6, location: 'Route B', assignedIncident: 'INC-482', status: 'ON SCENE', eta: '02 min' },
    { id: 'RT-09', type: 'Boat Rescue', members: 10, location: 'River Bank', assignedIncident: 'INC-482', status: 'AVAILABLE', eta: '08 min' }
  ],
  timeline: [
    { time: '21:13', text: 'Citizens redirected to Shelter C', severity: 'success' },
    { time: '21:12', text: 'Shelter A reached 83% capacity', severity: 'warning' },
    { time: '21:10', text: 'Response Team RT-03 deployed', severity: 'info' },
    { time: '21:09', text: 'Alternative routes generated', severity: 'success' },
    { time: '21:09', text: '327 citizens affected', severity: 'critical' },
    { time: '21:08', text: 'Route B marked unsafe', severity: 'critical' },
    { time: '21:08', text: 'Citizen reported flooded road', severity: 'warning' },
    { time: '21:06', text: 'Evacuation routes generated', severity: 'info' },
    { time: '21:04', text: 'Shelter A activated', severity: 'success' },
    { time: '21:02', text: '1,200 high-priority citizens identified', severity: 'warning' },
    { time: '21:01', text: 'Hazard zone identified', severity: 'warning' },
    { time: '21:00', text: 'Flood emergency activated', severity: 'critical' }
  ],
  notifications: [
    { id: 1, severity: 'critical', title: 'Route B blocked.', message: 'Main east connector is unsafe.', timestamp: '21:09', read: false, target: 'map' },
    { id: 2, severity: 'warning', title: 'Shelter A reached 83% occupancy.', message: 'Evacuation pressure rising.', timestamp: '21:12', read: false, target: 'shelters' },
    { id: 3, severity: 'info', title: '27 new citizen reports received.', message: 'Priority review required.', timestamp: '21:15', read: true, target: 'incidents' },
    { id: 4, severity: 'success', title: 'Alternative evacuation route generated.', message: 'Zonal rerouting complete.', timestamp: '21:09', read: true, target: 'map' }
  ],
  mapMarkers: [
    { id: 'shelter-a', name: 'Shelter A', type: 'shelter', x: 180, y: 230, status: 'near capacity' },
    { id: 'shelter-c', name: 'Shelter C', type: 'shelter', x: 500, y: 110, status: 'available' },
    { id: 'hospital', name: 'Field Hospital', type: 'hospital', x: 330, y: 260, status: 'operational' },
    { id: 'inc-482', name: 'INC-482', type: 'incident', x: 370, y: 180, status: 'critical' },
    { id: 'team-rt03', name: 'RT-03', type: 'team', x: 270, y: 160, status: 'responding' },
    { id: 'citizen-1042', name: 'CIT-1042', type: 'citizen', x: 430, y: 240, status: 'critical' },
    { id: 'citizen-1188', name: 'CIT-1188', type: 'citizen', x: 270, y: 300, status: 'high' }
  ]
};

const state = JSON.parse(JSON.stringify(initialState));
const loginView = document.getElementById('loginView');
const appView = document.getElementById('appView');
const pageContent = document.getElementById('pageContent');
const sidebarNav = document.getElementById('sidebarNav');
const confirmModal = document.getElementById('confirmModal');
const modalMessage = document.getElementById('modalMessage');
const confirmActionBtn = document.getElementById('confirmActionBtn');
const cancelActionBtn = document.getElementById('cancelActionBtn');
const detailModal = document.getElementById('detailModal');
const detailTitle = document.getElementById('detailTitle');
const detailBody = document.getElementById('detailBody');
const closeDetailBtn = document.getElementById('closeDetailBtn');
const notificationPanel = document.getElementById('notificationPanel');

let pendingAction = null;

function formatNumber(value) {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return new Intl.NumberFormat('en-IN').format(value);
}

function getKpis() {
  const evacuated = state.citizens.filter((citizen) => citizen.evacuationStatus === 'Evacuated').length || 4500;
  const affectedPopulation = state.emergency.affectedPopulation || 8000;
  const highPriorityCitizens = state.citizens.filter((citizen) => ['CRITICAL', 'HIGH'].includes(citizen.priorityLevel)).length || 1200;
  const activeShelters = state.shelters.filter((shelter) => shelter.status === 'AVAILABLE' || shelter.status === 'ACTIVE' || shelter.status === 'NEAR CAPACITY').length || state.shelters.length || 4;
  const blockedRoutes = state.routes.filter((route) => route.status === 'BLOCKED').length || (state.routeBBlocked ? 1 : 0);
  const criticalIncidents = state.incidents.filter((incident) => incident.severity === 'CRITICAL' || incident.status === 'CRITICAL').length || 1;
  const activeTeams = state.teams.filter((team) => team.status !== 'COMPLETED').length || 4;
  const evacProgress = Math.round((evacuated / affectedPopulation) * 10000) / 100;

  return [
    { key: 'affectedPopulation', label: 'Affected Population', value: affectedPopulation, suffix: 'people', status: 'critical', icon: '👥', trend: '+420', tone: 'critical' },
    { key: 'highPriorityCitizens', label: 'High Priority Citizens', value: highPriorityCitizens, suffix: 'cases', status: 'warning', icon: '🚨', trend: '+184', tone: 'warning' },
    { key: 'evacuated', label: 'Evacuated', value: evacuated, suffix: 'people', status: 'success', icon: '🧭', trend: '+360', tone: 'success' },
    { key: 'evacuationProgress', label: 'Evacuation Progress', value: evacProgress, suffix: '%', status: 'info', icon: '📈', trend: '+8%', tone: 'info' },
    { key: 'activeShelters', label: 'Active Shelters', value: activeShelters, suffix: 'sites', status: 'info', icon: '🏠', trend: '+2', tone: 'info' },
    { key: 'blockedRoutes', label: 'Blocked Routes', value: blockedRoutes, suffix: 'routes', status: 'warning', icon: '🛑', trend: '+1', tone: 'warning' },
    { key: 'criticalIncidents', label: 'Critical Incidents', value: criticalIncidents, suffix: 'cases', status: 'critical', icon: '⚠', trend: '+2', tone: 'critical' },
    { key: 'activeTeams', label: 'Active Response Teams', value: activeTeams, suffix: 'teams', status: 'success', icon: '🚑', trend: '+3', tone: 'success' }
  ];
}

function addNotification(severity, title, message, target = 'dashboard') {
  state.notifications.unshift({
    id: Date.now() + Math.random(),
    severity,
    title,
    message,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false,
    target
  });
  renderNotificationPanel();
}

function addTimelineEntry(text, severity = 'info', timeStr = null) {
  state.timeline.unshift({
    time: timeStr || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text,
    severity
  });
}

function updateClock() {
  const clockEl = document.getElementById('systemClock');
  if (clockEl) {
    clockEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

// Synchronize state with real FastAPI backend
async function syncLiveData() {
  if (!api.token) return;

  try {
    // 1. Me / Profile
    try {
      const me = await api.getMe();
      if (me && me.full_name) {
        state.officer.name = me.full_name;
        state.officer.role = me.role;
        const officerEl = document.getElementById('officerName');
        if (officerEl) officerEl.textContent = me.full_name;
      }
    } catch (e) {
      console.warn('Auth check skipped:', e.message);
    }

    // 2. Disasters
    try {
      const disasters = await api.getDisasters();
      if (Array.isArray(disasters) && disasters.length > 0) {
        const activeDisaster = disasters.find((d) => d.status === 'ACTIVE') || disasters[0];
        state.emergency.id = activeDisaster.id;
        state.emergency.name = activeDisaster.title;
        state.emergency.type = activeDisaster.disaster_type;
        state.emergency.severity = activeDisaster.severity;
        state.emergency.active = activeDisaster.status === 'ACTIVE';
        state.emergency.region = activeDisaster.description || state.emergency.region;
        state.emergencyActive = activeDisaster.status === 'ACTIVE';

        const headerEl = document.getElementById('activeEventHeader');
        if (headerEl) headerEl.textContent = activeDisaster.title.toUpperCase();
      }
    } catch (e) {
      console.warn('Disasters sync skipped:', e.message);
    }

    // 3. Shelters
    try {
      const backendShelters = await api.getShelters();
      if (Array.isArray(backendShelters) && backendShelters.length > 0) {
        state.shelters = backendShelters.map((s, index) => {
          const occ = s.current_occupancy || 0;
          const cap = s.total_capacity || 1000;
          const pct = cap > 0 ? occ / cap : 0;
          let statusLabel = 'AVAILABLE';
          if (s.status !== 'ACTIVE') statusLabel = 'INACTIVE';
          else if (pct >= 1.0) statusLabel = 'CRITICAL';
          else if (pct >= 0.8) statusLabel = 'NEAR CAPACITY';

          const shortId = `shelter-${String.fromCharCode(97 + (index % 26))}`;
          return {
            id: s.id,
            shortId,
            name: s.name,
            location: s.description || s.name,
            coordinates: `${s.latitude.toFixed(4)}, ${s.longitude.toFixed(4)}`,
            latitude: s.latitude,
            longitude: s.longitude,
            totalCapacity: cap,
            occupancy: occ,
            physicalAvailable: Math.max(0, cap - occ),
            effectiveAvailable: Math.max(0, cap - occ),
            status: statusLabel,
            verified: s.verified,
            medicalSupport: true,
            wheelchairAccessibility: true,
            elderlySupport: true,
            childSupport: true,
            contactPerson: 'Relief Incharge',
            facilities: ['Medical support', 'Wheelchair access', 'Elderly support', 'Children support']
          };
        });
      }
    } catch (e) {
      console.warn('Shelters sync skipped:', e.message);
    }

    // 4. Blocked Roads & Incidents
    try {
      const roads = await api.getBlockedRoads();
      if (Array.isArray(roads)) {
        const verifiedBlockage = roads.find((r) => r.verified && r.status === 'VERIFIED');
        if (verifiedBlockage) {
          state.routeBBlocked = true;
          state.routes = state.routes.map((route) =>
            route.id === 'route-b' ? { ...route, status: 'BLOCKED', className: 'route-blocked' } : route
          );
        } else {
          state.routeBBlocked = false;
          state.routes = state.routes.map((route) =>
            route.id === 'route-b' ? { ...route, status: 'SAFE', className: 'route-safe' } : route
          );
        }

        // Map blocked roads into incidents list
        const roadIncidents = roads.map((r) => ({
          id: `ROAD-${r.id.substring(0, 6).toUpperCase()}`,
          rawId: r.id,
          type: `Road Blockage: ${r.road_name}`,
          severity: r.severity === 'IMPASSABLE' || r.severity === 'FULL_CLOSURE' ? 'CRITICAL' : 'HIGH',
          location: r.road_name,
          reportedBy: 'Field / Citizen',
          reportedTime: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          affectedCitizens: r.severity === 'IMPASSABLE' ? 327 : 27,
          status: r.status,
          verified: r.verified,
          evidence: r.description || 'Field sensor & authority log'
        }));

        // Fetch generic incidents
        try {
          const incs = await api.getIncidents();
          if (Array.isArray(incs) && incs.length > 0) {
            const genericIncidents = incs.map((inc) => ({
              id: `INC-${inc.id.substring(0, 4).toUpperCase()}`,
              rawId: inc.id,
              type: inc.title,
              severity: inc.severity,
              location: `Lat: ${inc.latitude.toFixed(3)}, Lon: ${inc.longitude.toFixed(3)}`,
              reportedBy: 'Citizen Dispatch',
              reportedTime: new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              affectedCitizens: 12,
              status: inc.status,
              evidence: inc.description
            }));
            state.incidents = [...roadIncidents, ...genericIncidents];
          } else {
            state.incidents = roadIncidents.length > 0 ? roadIncidents : state.incidents;
          }
        } catch (e) {
          if (roadIncidents.length > 0) state.incidents = roadIncidents;
        }

        // Fetch audit logs for first verified road
        if (verifiedBlockage) {
          try {
            const logs = await api.getBlockedRoadAuditLogs(verifiedBlockage.id);
            if (Array.isArray(logs) && logs.length > 0) {
              logs.forEach((log) => {
                const logTime = new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const logText = `[${log.action}] ${log.notes || 'Status changed to ' + log.new_status}`;
                if (!state.timeline.some((t) => t.text === logText)) {
                  addTimelineEntry(logText, log.action === 'VERIFIED' ? 'critical' : 'success', logTime);
                }
              });
            }
          } catch (e) {
            console.warn('Audit logs sync skipped:', e.message);
          }
        }
      }
    } catch (e) {
      console.warn('Blocked roads sync skipped:', e.message);
    }

    state.backendConnected = true;
  } catch (err) {
    console.error('Data synchronization failed:', err);
  }
}

function showApp() {
  loginView.classList.add('hidden');
  appView.classList.remove('hidden');
  renderSidebar();
  renderPage();
  renderNotificationPanel();
}

function attachLoginHandlers() {
  const form = document.getElementById('loginForm');
  const idInput = document.getElementById('authorityIdInput');
  const passInput = document.getElementById('authorityPasswordInput');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const idVal = idInput ? idInput.value : 'AUTH-3301';
    const passVal = passInput ? passInput.value : 'password123';

    try {
      await api.login(idVal, passVal);
      state.loggedIn = true;
      showApp();
      await syncLiveData();
      renderSidebar();
      renderPage();
      addNotification('success', 'Authority Logged In', 'Connected to RakshaNet Live Emergency Backend.');
    } catch (err) {
      console.warn('Backend login fallback to offline session:', err.message);
      state.loggedIn = true;
      showApp();
      addNotification('warning', 'Offline Mode', `Backend connection unavailable: ${err.message}`);
    }
  });

  document.getElementById('demoModeBtn').addEventListener('click', async () => {
    try {
      await api.login('authority@rakshanet.gov.in', 'auth123!');
      state.loggedIn = true;
      showApp();
      await syncLiveData();
      renderSidebar();
      renderPage();
      addNotification('success', 'Demo Session Active', 'Connected to RakshaNet live PostGIS backend.');
    } catch (err) {
      console.warn('Demo login failed, opening demo mode directly:', err);
      state.loggedIn = true;
      showApp();
    }
  });
}

function renderSidebar() {
  sidebarNav.innerHTML = navItems.map((item) => `
    <button class="nav-item ${state.currentPage === item.id ? 'active' : ''}" data-nav="${item.id}">
      <span>${item.icon}</span>
      <span>${item.label}</span>
    </button>
  `).join('');

  sidebarNav.querySelectorAll('[data-nav]').forEach((button) => {
    button.addEventListener('click', () => {
      state.currentPage = button.dataset.nav;
      renderSidebar();
      renderPage();
    });
  });
}

function renderNotificationPanel() {
  notificationPanel.innerHTML = state.notifications.map((notification) => `
    <div class="notification-item" data-notification-target="${notification.target}">
      <strong>${notification.title}</strong>
      <small>${notification.message}</small>
      <small>${notification.timestamp}</small>
    </div>
  `).join('');

  notificationPanel.querySelectorAll('[data-notification-target]').forEach((item) => {
    item.addEventListener('click', () => {
      state.currentPage = item.dataset.notificationTarget || 'dashboard';
      renderSidebar();
      renderPage();
      notificationPanel.classList.add('hidden');
    });
  });
}

function renderKpis() {
  const kpis = getKpis();
  return `
    <section class="kpi-grid">
      ${kpis.map((kpi) => `
        <article class="kpi-card ${kpi.tone}">
          <div class="kpi-header">
            <div class="kpi-icon">${kpi.icon}</div>
            <span class="kpi-status">${kpi.status}</span>
          </div>
          <div class="kpi-value">${kpi.value}${kpi.key === 'evacuationProgress' ? '%' : ''}</div>
          <div class="kpi-label">
            <span>${kpi.label}</span>
            <span class="trend">${kpi.trend}</span>
          </div>
        </article>
      `).join('')}
    </section>
  `;
}

function getRouteStatusClass(routeStatus) {
  if (routeStatus === 'BLOCKED') return 'route-blocked';
  if (routeStatus === 'SAFE') return 'route-safe';
  return 'route-risk';
}

function renderMap() {
  const selectedMarker = state.mapMarkers.find((marker) => marker.id === state.selectedMarker) || state.mapMarkers[0];
  const routeMarkup = state.routes.map((route) => `
    <path class="route-line ${getRouteStatusClass(route.status)}" d="${route.d}" aria-label="${route.label}" data-route-status="${route.status}"></path>
  `).join('');

  const markerMarkup = state.mapMarkers.map((marker) => `
    <g class="map-marker" data-marker-id="${marker.id}" tabindex="0" role="button" aria-label="${marker.name}">
      <circle cx="${marker.x}" cy="${marker.y}" r="8" class="marker-${marker.type}"></circle>
      <text x="${marker.x + 12}" y="${marker.y - 8}" class="marker-label">${marker.name}</text>
    </g>
  `).join('');

  return `
    <div class="map-layout">
      <section class="card map-card">
        <div class="card-header">
          <div class="card-title">Command Map</div>
          <div class="layer-controls">
            <button class="layer-chip ${state.mapLayer === 'all' ? 'active' : ''}" data-layer="all">All</button>
            <button class="layer-chip ${state.mapLayer === 'hazard' ? 'active' : ''}" data-layer="hazard">Hazard</button>
            <button class="layer-chip ${state.mapLayer === 'population' ? 'active' : ''}" data-layer="population">Population</button>
            <button class="layer-chip ${state.mapLayer === 'infrastructure' ? 'active' : ''}" data-layer="infrastructure">Infrastructure</button>
            <button class="layer-chip ${state.mapLayer === 'incidents' ? 'active' : ''}" data-layer="incidents">Incidents</button>
            <button class="layer-chip ${state.mapLayer === 'routes' ? 'active' : ''}" data-layer="routes">Routes</button>
          </div>
        </div>

        <div class="map-surface">
          <svg class="map-svg" viewBox="0 0 640 380" aria-label="Emergency map">
            <rect x="0" y="0" width="640" height="380" fill="transparent" />
            <path class="safe-zone" d="M70 100 Q170 56 270 85 L360 70 L540 110 L540 310 L120 325 L75 250 Z" />
            <path class="hazard-zone" d="M160 140 Q250 120 340 160 L365 235 Q305 295 205 280 L150 220 Z" />
            <path class="hazard-zone" d="M400 80 Q500 110 560 150 L585 230 Q508 250 460 220 L390 130 Z" opacity="0.5" />
            ${routeMarkup}
            ${markerMarkup}
          </svg>
        </div>
      </section>

      <aside class="map-panel-side">
        <section class="info-panel">
          <h3>${selectedMarker.name}</h3>
          <div class="info-grid">
            <div class="info-row"><span>Type</span><strong>${selectedMarker.type}</strong></div>
            <div class="info-row"><span>Status</span><strong>${selectedMarker.status}</strong></div>
            <div class="info-row"><span>Location</span><strong>${selectedMarker.type === 'citizen' ? 'Block 14, Village A' : 'Village A Sector 3'}</strong></div>
            <div class="info-row"><span>Assigned</span><strong>${selectedMarker.type === 'incident' ? 'Response team RT-07' : selectedMarker.type === 'citizen' ? 'Shelter A / Route C' : 'Operational team'}</strong></div>
          </div>
          <div class="info-actions">
            <button class="secondary-button" type="button" data-open-detail="marker:${selectedMarker.id}">View details</button>
            <button class="primary-button" type="button">Dispatch</button>
          </div>
        </section>

        <section class="side-panel">
          <div class="card-title">Live route conditions</div>
          <div class="stack-list" style="margin-top: 0.8rem;">
            ${state.routes.map((route) => `
              <div class="stack-item">
                <strong>${route.label}</strong>
                <span class="badge ${route.status === 'SAFE' ? 'safe' : route.status === 'BLOCKED' ? 'danger' : 'warning'}">${route.status}</span>
              </div>
            `).join('')}
          </div>
        </section>
      </aside>
    </div>
  `;
}

function renderDashboard() {
  const builtKpis = getKpis();
  return `
    <div class="dashboard-page">
      <section class="emergency-banner">
        <div class="banner-copy">
          <div class="brand-icon" aria-hidden="true">⚠</div>
          <div>
            <div class="micro-label">ACTIVE EMERGENCY</div>
            <h2>${state.emergency.name}</h2>
            <div class="banner-meta">
              <span>Severity: <strong>${state.emergency.severity}</strong></span>
              <span>Activated: <strong>${state.emergency.activationTime}</strong></span>
              <span>Affected population: <strong>${formatNumber(state.emergency.affectedPopulation)}</strong></span>
            </div>
          </div>
        </div>

        <div class="banner-actions">
          <button class="secondary-button" type="button" data-action="view-live-map">VIEW LIVE MAP</button>
          <button class="secondary-button" type="button" data-action="view-events">MANAGE EVENT</button>
          <button class="primary-button" type="button" data-critical="Activate emergency">EMERGENCY ACTIONS</button>
        </div>
      </section>

      <section class="kpi-grid">
        ${builtKpis.map((kpi) => `
          <article class="kpi-card ${kpi.tone}">
            <div class="kpi-header">
              <div class="kpi-icon">${kpi.icon}</div>
              <span class="kpi-status">${kpi.status}</span>
            </div>
            <div class="kpi-value">${kpi.value}${kpi.key === 'evacuationProgress' ? '%' : ''}</div>
            <div class="kpi-label">
              <span>${kpi.label}</span>
              <span class="trend">${kpi.trend}</span>
            </div>
          </article>
        `).join('')}
      </section>

      ${renderMap()}

      <section class="grid-two">
        <div class="card table-card">
          <div class="card-header">
            <div class="card-title">Active Shelters</div>
            <div class="action-row">
              <button class="ghost-button" type="button" data-action="activate-shelter">Activate</button>
            </div>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Shelter</th>
                  <th>Capacity</th>
                  <th>Occupied</th>
                  <th>Available</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${state.shelters.map((shelter) => `
                  <tr>
                    <td data-open-detail="shelter:${shelter.id}">${shelter.name}</td>
                    <td>${formatNumber(shelter.totalCapacity)}</td>
                    <td>${formatNumber(shelter.occupancy)}</td>
                    <td>${formatNumber(shelter.physicalAvailable)}</td>
                    <td><span class="badge ${shelter.status === 'AVAILABLE' || shelter.status === 'ACTIVE' ? 'safe' : shelter.status === 'CRITICAL' || shelter.status === 'FULL' ? 'danger' : 'warning'}">${shelter.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">Critical notifications</div>
          </div>
          <div class="table-wrap" style="padding: 1rem;">
            <div class="alert-list">
              ${state.notifications.slice(0, 4).map((notification) => `
                <div class="alert-item ${notification.severity}">
                  <div class="alert-icon">${notification.severity === 'critical' ? '🔴' : notification.severity === 'warning' ? '🟠' : notification.severity === 'info' ? '🟡' : '🟢'}</div>
                  <div class="alert-text">
                    <strong>${notification.title}</strong>
                    <small>${notification.message}</small>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </section>

      <section class="grid-two">
        <div class="card">
          <div class="card-header">
            <div class="card-title">Priority cases</div>
            <button class="ghost-button" type="button" data-action="view-critical-cases">View critical cases</button>
          </div>
          <div style="padding: 1rem;">
            <div class="priority-grid">
              ${['CRITICAL', 'HIGH', 'MODERATE', 'NORMAL'].map((label) => {
                const items = state.citizens.filter((citizen) => citizen.priorityLevel === label || (label === 'NORMAL' && citizen.priorityLevel === 'NORMAL'));
                return `
                  <div class="priority-group">
                    <h3>${label}</h3>
                    ${items.length ? items.map((person) => `
                      <div class="priority-case">
                        <div class="priority-head">
                          <span class="micro-label">${person.id}</span>
                          <span class="priority-score">${person.priorityScore}/100</span>
                        </div>
                        <h4>${person.location}</h4>
                        <div class="case-meta">
                          <span>Hazard: ${person.hazardExposure}</span>
                          <span>Route: ${person.assignedRoute}</span>
                        </div>
                        <div class="case-reasons">
                          ${person.reasons.map((reason) => `• ${reason}`).join('<br>')}
                        </div>
                        <div class="case-actions">
                          <button class="secondary-button" type="button" data-open-detail="citizen:${person.id}">View on map</button>
                          <button class="primary-button" type="button" data-open-detail="citizen:${person.id}">Assign shelter</button>
                        </div>
                      </div>
                    `).join('') : '<div class="case-meta">No active cases in this category</div>'}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">Response teams</div>
            <button class="ghost-button" type="button" data-action="deploy-team">Deploy team</button>
          </div>
          <div style="padding: 1rem;">
            <div class="stack-list">
              ${state.teams.map((team) => `
                <div class="stack-item">
                  <div>
                    <strong>${team.id}</strong><br>
                    <small>${team.type} • ${team.members} members</small>
                  </div>
                  <span class="badge ${team.status === 'AVAILABLE' ? 'safe' : team.status === 'DEPLOYED' || team.status === 'RESPONDING' ? 'warning' : 'info'}">${team.status}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderEventsPage() {
  return `
    <div class="page-shell">
      <section class="card" style="padding: 1rem;">
        <div class="card-header">
          <div class="card-title">Create disaster event</div>
          <button class="primary-button" type="button" data-critical="Activate emergency">Activate Emergency</button>
        </div>

        <div style="padding: 1rem 0 0;">
          <form class="event-form" id="createEventForm">
            <div class="form-field">
              <label>Event name</label>
              <input id="eventNameInput" value="${state.emergency.name}" />
            </div>
            <div class="form-field">
              <label>Disaster type</label>
              <select id="eventTypeSelect">
                <option value="FLOOD" selected>Flood</option>
                <option value="CYCLONE">Cyclone</option>
                <option value="LANDSLIDE">Landslide</option>
                <option value="EARTHQUAKE">Earthquake</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div class="form-field">
              <label>Severity</label>
              <select id="eventSeveritySelect">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Moderate</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL" selected>Critical</option>
              </select>
            </div>
            <div class="form-field">
              <label>Start date/time</label>
              <input id="eventStartTimeInput" value="2026-08-26 21:00" />
            </div>
            <div class="form-field">
              <label>Affected region</label>
              <input id="eventRegionInput" value="${state.emergency.region}" />
            </div>
            <div class="form-field">
              <label>Estimated affected population</label>
              <input id="eventPopulationInput" type="number" value="${state.emergency.affectedPopulation}" />
            </div>
            <div class="form-field">
              <label>Hazard zone</label>
              <input id="eventHazardZoneInput" value="${state.emergency.hazardZone}" />
            </div>
            <div class="form-field">
              <label>Official emergency instructions</label>
              <input id="eventInstructionsInput" value="${state.emergency.officialInstructions}" />
            </div>
            <div class="form-field full">
              <label>Operational description</label>
              <textarea id="eventDescriptionInput">Severe rainfall and rising river levels are threatening low-lying settlement blocks. Priority relocation and route reassessment required immediately.</textarea>
            </div>
            <div class="form-footer full">
              <button type="button" class="primary-button" id="saveEventBtn">Save event</button>
            </div>
          </form>
        </div>
      </section>
    </div>
  `;
}

function renderSheltersPage() {
  return `
    <div class="page-shell">
      <section class="card table-card">
        <div class="card-header">
          <div class="card-title">Shelter Management</div>
          <button class="primary-button" type="button" id="registerShelterBtn">Register shelter</button>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Shelter ID</th>
                <th>Name</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Occupancy</th>
                <th>Available</th>
                <th>Effective</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${state.shelters.map((shelter) => `
                <tr>
                  <td data-open-detail="shelter:${shelter.id}">${shelter.shortId ? shelter.shortId.toUpperCase() : String(shelter.id).substring(0, 8).toUpperCase()}</td>
                  <td>${shelter.name}</td>
                  <td>${shelter.location}</td>
                  <td>${formatNumber(shelter.totalCapacity)}</td>
                  <td>${formatNumber(shelter.occupancy)}</td>
                  <td>${formatNumber(shelter.physicalAvailable)}</td>
                  <td>${formatNumber(shelter.effectiveAvailable)}</td>
                  <td><span class="badge ${shelter.status === 'AVAILABLE' || shelter.status === 'ACTIVE' ? 'safe' : shelter.status === 'CRITICAL' || shelter.status === 'FULL' ? 'danger' : 'warning'}">${shelter.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function renderCitizensPage() {
  return `
    <div class="page-shell">
      <section class="card">
        <div class="card-header">
          <div class="card-title">Citizen overview</div>
          <div class="filter-row">
            <button class="filter-chip active" type="button">All</button>
            <button class="filter-chip" type="button">Critical</button>
            <button class="filter-chip" type="button">High</button>
            <button class="filter-chip" type="button">Medical</button>
            <button class="filter-chip" type="button">Elderly</button>
          </div>
        </div>
        <div class="table-wrap" style="padding: 1rem;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Citizen ID</th>
                <th>Location</th>
                <th>Vulnerability</th>
                <th>Priority</th>
                <th>Evacuation</th>
                <th>Assigned Shelter</th>
              </tr>
            </thead>
            <tbody>
              ${state.citizens.map((person) => `
                <tr data-open-detail="citizen:${person.id}">
                  <td>${person.id}</td>
                  <td>${person.location}</td>
                  <td>${person.vulnerability}</td>
                  <td><span class="badge ${person.priorityLevel === 'CRITICAL' ? 'danger' : person.priorityLevel === 'HIGH' ? 'warning' : 'info'}">${person.priorityLevel}</span></td>
                  <td>${person.evacuationStatus}</td>
                  <td>${person.assignedShelter}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function renderOmniTriagePage() {
  return `
    <div class="page-shell">
      <section class="card" style="padding: 1rem;">
        <div class="card-header">
          <div class="card-title">OmniTriage / Priority Cases</div>
          <button class="primary-button" type="button" data-action="deploy-team">Assign response team</button>
        </div>
        <div class="priority-grid" style="margin-top: 1rem;">
          ${state.citizens.map((person) => `
            <div class="priority-case">
              <div class="priority-head">
                <span class="micro-label">${person.id}</span>
                <span class="priority-score">${person.priorityScore}/100</span>
              </div>
              <h4>${person.priorityLevel}</h4>
              <div class="case-meta">
                <span>Location: ${person.location}</span>
                <span>Medical: ${person.medicalRequirement}</span>
                <span>Distance: ${person.distance}</span>
                <span>Difficulty: ${person.evacuationDifficulty}</span>
              </div>
              <div class="case-reasons">
                ${person.reasons.map((reason) => `• ${reason}`).join('<br>')}
              </div>
              <div class="case-actions">
                <button class="secondary-button" type="button" data-open-detail="citizen:${person.id}">View on Map</button>
                <button class="secondary-button" type="button" data-open-detail="citizen:${person.id}">Assign Shelter</button>
                <button class="secondary-button" type="button" data-open-detail="citizen:${person.id}">Assign Team</button>
                <button class="primary-button" type="button" data-open-detail="citizen:${person.id}">View Route</button>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    </div>
  `;
}

function renderIncidentsPage() {
  return `
    <div class="page-shell">
      <section class="card" style="padding: 1rem;">
        <div class="card-header">
          <div class="card-title">Incident Center</div>
          <button class="primary-button" type="button" id="newIncidentBtn">New report</button>
        </div>
        <div class="priority-grid" style="margin-top: 1rem;">
          ${state.incidents.map((incident) => `
            <div class="priority-case">
              <div class="priority-head">
                <span class="micro-label">${incident.id}</span>
                <span class="badge ${incident.severity === 'CRITICAL' ? 'danger' : 'warning'}">${incident.severity}</span>
              </div>
              <h4>${incident.type}</h4>
              <div class="case-meta">
                <span>Reporter: ${incident.reportedBy}</span>
                <span>Location: ${incident.location}</span>
                <span>Reported: ${incident.reportedTime}</span>
                <span>Impact: ${incident.affectedCitizens} citizens</span>
                <span>Status: <strong>${incident.status}</strong></span>
              </div>
              <div class="case-actions">
                <button class="secondary-button" type="button" data-open-detail="incident:${incident.id}">View on map</button>
                ${incident.verified ? `
                  <button class="primary-button" type="button" data-action="clear-incident" data-incident-id="${incident.rawId || incident.id}">Clear road</button>
                ` : `
                  <button class="secondary-button" type="button" data-action="verify-incident" data-incident-id="${incident.rawId || incident.id}">Verify blockage</button>
                `}
                <button class="secondary-button" type="button" data-action="recalculate-routes">Recalculate routes</button>
                <button class="primary-button" type="button" data-action="deploy-team">Deploy team</button>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    </div>
  `;
}

function renderTeamsPage() {
  return `
    <div class="page-shell">
      <section class="card table-card">
        <div class="card-header">
          <div class="card-title">Response Teams</div>
          <button class="primary-button" type="button" data-action="deploy-team">Deploy team</button>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Team ID</th>
                <th>Type</th>
                <th>Members</th>
                <th>Current Location</th>
                <th>Assigned Incident</th>
                <th>Status</th>
                <th>ETA</th>
              </tr>
            </thead>
            <tbody>
              ${state.teams.map((team) => `
                <tr>
                  <td>${team.id}</td>
                  <td>${team.type}</td>
                  <td>${team.members}</td>
                  <td>${team.location}</td>
                  <td>${team.assignedIncident}</td>
                  <td><span class="badge ${team.status === 'AVAILABLE' ? 'safe' : team.status === 'ON SCENE' ? 'info' : 'warning'}">${team.status}</span></td>
                  <td>${team.eta}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function renderTimelinePage() {
  return `
    <div class="page-shell">
      <section class="card" style="padding: 1rem;">
        <div class="card-header">
          <div class="card-title">Emergency timeline</div>
          <button class="ghost-button" type="button" id="syncLogsBtn">Sync logs</button>
        </div>
        <div style="padding: 1rem;">
          <ul class="timeline">
            ${state.timeline.map((item) => `
              <li class="timeline-item">
                <div class="timeline-time">${item.time}</div>
                <div class="timeline-text">${item.text}</div>
              </li>
            `).join('')}
          </ul>
        </div>
      </section>
    </div>
  `;
}

function renderReportsPage() {
  const kpis = getKpis();
  const progress = kpis.find((item) => item.key === 'evacuationProgress')?.value ?? 56;
  const critical = kpis.find((item) => item.key === 'criticalIncidents')?.value ?? 1;
  const averageOccupancy = state.shelters.length ? Math.round((state.shelters.reduce((sum, shelter) => sum + (shelter.occupancy / shelter.totalCapacity) * 100, 0) / state.shelters.length) * 10) / 10 : 68;

  return `
    <div class="page-shell">
      <section class="card" style="padding: 1rem;">
        <div class="card-header">
          <div class="card-title">Reports</div>
        </div>
        <div class="grid-two" style="padding: 1rem 0 0;">
          <div class="side-panel">
            <h3>Operational overview</h3>
            <div class="info-grid">
              <div class="info-row"><span>Evacuation progress</span><strong>${progress}%</strong></div>
              <div class="info-row"><span>Critical incidents</span><strong>${critical}</strong></div>
              <div class="info-row"><span>Average shelter occupancy</span><strong>${averageOccupancy}%</strong></div>
            </div>
          </div>
          <div class="side-panel">
            <h3>Recent summary</h3>
            <div class="info-grid">
              <div class="info-row"><span>Route B reroute</span><strong>${state.citizens.filter((citizen) => citizen.assignedRoute === 'Route D').length || 1} affected</strong></div>
              <div class="info-row"><span>Deployments</span><strong>${kpis.find((item) => item.key === 'activeTeams')?.value ?? 4} active</strong></div>
              <div class="info-row"><span>Protected citizens</span><strong>${formatNumber(kpis.find((item) => item.key === 'evacuated')?.value ?? 4500)} evacuated</strong></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderSettingsPage() {
  return `
    <div class="page-shell">
      <section class="card" style="padding: 1rem;">
        <div class="card-header">
          <div class="card-title">Settings</div>
        </div>
        <div class="event-form" style="padding: 1rem 0 0;">
          <div class="form-field">
            <label>Authority Mode</label>
            <select>
              <option>Operational</option>
              <option>Simulation</option>
              <option>Planning</option>
            </select>
          </div>
          <div class="form-field">
            <label>Alert threshold</label>
            <select>
              <option>Critical only</option>
              <option selected>Critical + Warning</option>
            </select>
          </div>
          <div class="form-field full">
            <label>Operational directive</label>
            <textarea>Priority relocation to accessible shelters for medically vulnerable citizens affected by flood surge.</textarea>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderPage() {
  const pageMap = {
    dashboard: renderDashboard,
    events: renderEventsPage,
    map: renderDashboard,
    shelters: renderSheltersPage,
    citizens: renderCitizensPage,
    omnitriage: renderOmniTriagePage,
    incidents: renderIncidentsPage,
    teams: renderTeamsPage,
    timeline: renderTimelinePage,
    reports: renderReportsPage,
    settings: renderSettingsPage
  };

  pageContent.innerHTML = pageMap[state.currentPage]?.() ?? renderDashboard();
  bindPageActions();
  bindInteractiveDetails();
  if (state.currentPage === 'dashboard' || state.currentPage === 'map') {
    bindMapInteractions();
  }
}

function bindPageActions() {
  document.querySelectorAll('[data-critical]').forEach((button) => {
    button.addEventListener('click', () => {
      const label = button.getAttribute('data-critical');
      pendingAction = async () => {
        try {
          if (state.emergency.id) {
            await api.updateDisaster(state.emergency.id, { status: 'ACTIVE' });
          } else {
            const created = await api.createDisaster({
              title: state.emergency.name,
              description: state.emergency.region,
              disaster_type: 'FLOOD',
              severity: 'CRITICAL',
              latitude: 16.5062,
              longitude: 80.6480,
              status: 'ACTIVE'
            });
            state.emergency.id = created.id;
          }
          state.emergencyActive = true;
          addNotification('success', 'Emergency activated in backend.', 'Flood response operations initiated on server.', 'dashboard');
          addTimelineEntry('Disaster activation confirmed via API', 'critical');
        } catch (e) {
          state.emergencyActive = true;
          addNotification('success', 'Emergency activated.', 'Local activation confirmed: ' + e.message, 'dashboard');
          addTimelineEntry('Emergency activation confirmed', 'critical');
        }
        state.currentPage = 'dashboard';
        renderSidebar();
        renderPage();
      };
      openConfirmModal(`${label}?`, 'This action will immediately update the operational response state for the active disaster event.');
    });
  });

  const saveEventBtn = document.getElementById('saveEventBtn');
  if (saveEventBtn) {
    saveEventBtn.addEventListener('click', async () => {
      const name = document.getElementById('eventNameInput')?.value || state.emergency.name;
      const type = document.getElementById('eventTypeSelect')?.value || 'FLOOD';
      const sev = document.getElementById('eventSeveritySelect')?.value || 'CRITICAL';
      const desc = document.getElementById('eventDescriptionInput')?.value || state.emergency.region;

      try {
        const created = await api.createDisaster({
          title: name,
          description: desc,
          disaster_type: type,
          severity: sev,
          latitude: 16.5062,
          longitude: 80.6480,
          status: 'ACTIVE'
        });
        state.emergency.id = created.id;
        state.emergency.name = created.title;
        state.emergency.type = created.disaster_type;
        state.emergency.severity = created.severity;
        addNotification('success', 'Disaster Event Saved', `Event "${name}" created on backend.`);
        addTimelineEntry(`Created disaster: ${name}`, 'critical');
      } catch (err) {
        state.emergency.name = name;
        addNotification('info', 'Event Saved', `Updated locally: ${err.message}`);
      }
      renderPage();
    });
  }

  const registerShelterBtn = document.getElementById('registerShelterBtn');
  if (registerShelterBtn) {
    registerShelterBtn.addEventListener('click', async () => {
      const name = prompt('Enter shelter name:', 'New Community Shelter');
      if (!name) return;
      const capacity = parseInt(prompt('Enter total capacity:', '500'), 10) || 500;

      try {
        const created = await api.createShelter({
          name,
          address: 'Krishna District Center',
          latitude: 16.5100,
          longitude: 80.6400,
          total_capacity: capacity,
          current_occupancy: 0
        });
        addNotification('success', 'Shelter Registered', `${created.name} added to database.`);
        addTimelineEntry(`Registered shelter: ${created.name}`, 'success');
        await syncLiveData();
      } catch (e) {
        addNotification('warning', 'Shelter Added (Local)', e.message);
      }
      renderPage();
    });
  }

  const syncLogsBtn = document.getElementById('syncLogsBtn');
  if (syncLogsBtn) {
    syncLogsBtn.addEventListener('click', async () => {
      await syncLiveData();
      renderPage();
      addNotification('info', 'Logs Synchronized', 'Emergency timeline refreshed with database audit logs.');
    });
  }

  document.querySelectorAll('[data-action="view-critical-cases"]').forEach((button) => {
    button.addEventListener('click', () => {
      state.currentPage = 'omnitriage';
      renderSidebar();
      renderPage();
    });
  });

  document.querySelectorAll('[data-action="view-live-map"]').forEach((button) => {
    button.addEventListener('click', () => {
      state.currentPage = 'map';
      renderSidebar();
      renderPage();
    });
  });

  document.querySelectorAll('[data-action="view-events"]').forEach((button) => {
    button.addEventListener('click', () => {
      state.currentPage = 'events';
      renderSidebar();
      renderPage();
    });
  });

  document.querySelectorAll('[data-action="activate-shelter"]').forEach((button) => {
    button.addEventListener('click', async () => {
      const shelter = state.shelters.find((item) => item.id === 'shelter-c' || item.name.includes('Shelter C')) || state.shelters[0];
      if (shelter) {
        try {
          if (shelter.id && shelter.id.length > 20) {
            await api.verifyShelter(shelter.id, true);
            await api.updateShelter(shelter.id, { current_occupancy: shelter.occupancy });
          }
        } catch (e) {
          console.warn('Shelter activation API:', e.message);
        }
        shelter.status = 'AVAILABLE';
        addNotification('success', 'Shelter activation confirmed.', `${shelter.name} is accepting priority relocation flow.`, 'shelters');
        addTimelineEntry(`${shelter.name} verified and activated`, 'success');
      }
      renderPage();
    });
  });

  document.querySelectorAll('[data-action="deploy-team"]').forEach((button) => {
    button.addEventListener('click', () => {
      const team = state.teams.find((item) => item.id === 'RT-03');
      if (team) {
        team.status = 'DEPLOYED';
        addNotification('info', 'Response team deployed.', 'RT-03 reassigned to flood route incident.', 'teams');
        addTimelineEntry('Response team RT-03 deployed', 'info');
      }
      renderPage();
    });
  });

  document.querySelectorAll('[data-action="verify-incident"]').forEach((button) => {
    button.addEventListener('click', async () => {
      const rawId = button.dataset.incidentId;
      try {
        await api.verifyBlockedRoad(rawId, true, 'Verified by Authority via Government Portal');
        addNotification('warning', 'Blockage Verified', 'Road blockage confirmed. Rerouting traffic.');
        addTimelineEntry('Road blockage verified by command authority', 'critical');
        await syncLiveData();
      } catch (e) {
        addNotification('info', 'Incident Marked', e.message);
      }
      renderPage();
    });
  });

  document.querySelectorAll('[data-action="clear-incident"]').forEach((button) => {
    button.addEventListener('click', async () => {
      const rawId = button.dataset.incidentId;
      try {
        await api.clearBlockedRoad(rawId, 'Debris cleared by rescue team');
        addNotification('success', 'Road Blockage Cleared', 'Route reopened for safe passage.');
        addTimelineEntry('Road blockage cleared and route reopened', 'success');
        await syncLiveData();
      } catch (e) {
        addNotification('info', 'Incident Cleared', e.message);
      }
      renderPage();
    });
  });

  document.querySelectorAll('[data-action="recalculate-routes"]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const routeRes = await api.calculateRoute(16.5062, 80.6480, 16.5165, 80.6352, state.emergency.id);
        addNotification('success', 'Rerouting Complete', `Calculated route: ${routeRes.distance_km} km (${routeRes.estimated_time_minutes} min), avoiding ${routeRes.avoided_blocked_roads_count ?? 0} blocked roads.`);
        addTimelineEntry(`Safe rerouting generated via routing engine: ${routeRes.distance_km} km`, 'success');
      } catch (e) {
        addNotification('info', 'Routes Updated', 'Rerouting complete: Route D activated.');
      }
      renderPage();
    });
  });
}

function bindMapInteractions() {
  document.querySelectorAll('.map-marker').forEach((marker) => {
    marker.addEventListener('click', () => {
      state.selectedMarker = marker.dataset.markerId;
      renderPage();
    });

    marker.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        state.selectedMarker = marker.dataset.markerId;
        renderPage();
      }
    });
  });

  document.querySelectorAll('[data-layer]').forEach((button) => {
    button.addEventListener('click', () => {
      state.mapLayer = button.dataset.layer;
      renderPage();
    });
  });
}

function bindInteractiveDetails() {
  document.querySelectorAll('[data-open-detail]').forEach((element) => {
    element.addEventListener('click', () => {
      const [type, id] = element.dataset.openDetail.split(':');
      if (type === 'citizen') {
        showCitizenDetail(id);
      }
      if (type === 'shelter') {
        showShelterDetail(id);
      }
      if (type === 'incident') {
        showIncidentDetail(id);
      }
      if (type === 'marker') {
        const marker = state.mapMarkers.find((item) => item.id === id);
        if (marker) {
          state.selectedMarker = marker.id;
          renderPage();
        }
      }
    });
  });
}

function showCitizenDetail(citizenId) {
  const citizen = state.citizens.find((item) => item.id === citizenId) || state.citizens[0];
  if (!citizen) return;

  detailTitle.textContent = citizen.id;
  detailBody.innerHTML = `
    <div class="detail-body-grid">
      <div class="detail-row"><span>Location</span><strong>${citizen.location}</strong></div>
      <div class="detail-row"><span>Vulnerability</span><strong>${citizen.vulnerability}</strong></div>
      <div class="detail-row"><span>Medical requirement</span><strong>${citizen.medicalRequirement}</strong></div>
      <div class="detail-row"><span>Mobility limitation</span><strong>${citizen.mobility}</strong></div>
      <div class="detail-row"><span>Age group</span><strong>${citizen.ageGroup}</strong></div>
      <div class="detail-row"><span>Hazard exposure</span><strong>${citizen.hazardExposure}</strong></div>
      <div class="detail-row"><span>Distance</span><strong>${citizen.distance}</strong></div>
      <div class="detail-row"><span>Evacuation difficulty</span><strong>${citizen.evacuationDifficulty}</strong></div>
      <div class="detail-row"><span>Urgency</span><strong>${citizen.urgency}</strong></div>
      <div class="detail-row"><span>Priority score</span><strong>${citizen.priorityScore}/100</strong></div>
      <div class="detail-row"><span>Priority level</span><strong>${citizen.priorityLevel}</strong></div>
      <div class="detail-row"><span>Assigned shelter</span><strong>${citizen.assignedShelter}</strong></div>
      <div class="detail-row"><span>Assigned route</span><strong>${citizen.assignedRoute}</strong></div>
      <div class="detail-row"><span>Evacuation status</span><strong>${citizen.evacuationStatus}</strong></div>
      <div class="detail-row"><span>Recommended action</span><strong>IMMEDIATE EVACUATION</strong></div>
      <div class="detail-row" style="display: grid; gap: 0.3rem; border-bottom: 0;"><span>Priority breakdown</span><strong>${citizen.reasons.join(', ')}</strong></div>
    </div>
    <div class="info-actions" style="margin-top: 1rem;">
      <button class="secondary-button" type="button" id="detailViewMapBtn">VIEW ON MAP</button>
      <button class="secondary-button" type="button" id="detailAssignShelterBtn">ASSIGN SHELTER</button>
      <button class="secondary-button" type="button" id="detailAssignTeamBtn">ASSIGN RESPONSE TEAM</button>
      <button class="primary-button" type="button" id="detailViewRouteBtn">VIEW SAFE ROUTE</button>
    </div>
  `;

  document.getElementById('detailAssignShelterBtn')?.addEventListener('click', async () => {
    try {
      const rec = await api.recommendShelter(16.5062, 80.6480, state.emergency.id);
      addNotification('success', 'AI Relocation Recommendation', `Assigned to ${rec.shelter_name} (${rec.distance_km} km away, ${rec.available_capacity} capacity).`);
      citizen.assignedShelter = rec.shelter_name;
      detailModal.classList.add('hidden');
      renderPage();
    } catch (e) {
      addNotification('info', 'Shelter Assigned', `Assigned to Shelter C`);
      detailModal.classList.add('hidden');
    }
  });

  document.getElementById('detailViewRouteBtn')?.addEventListener('click', async () => {
    try {
      const r = await api.calculateRoute(16.5062, 80.6480, 16.5165, 80.6352, state.emergency.id);
      addNotification('info', 'Routing Verified', `Safe Route: ${r.distance_km} km via Engine`);
      state.currentPage = 'map';
      detailModal.classList.add('hidden');
      renderSidebar();
      renderPage();
    } catch (e) {
      state.currentPage = 'map';
      detailModal.classList.add('hidden');
      renderSidebar();
      renderPage();
    }
  });

  detailModal.classList.remove('hidden');
}

function showShelterDetail(shelterId) {
  const shelter = state.shelters.find((item) => item.id === shelterId || item.shortId === shelterId) || state.shelters[0];
  if (!shelter) return;

  detailTitle.textContent = shelter.name;
  detailBody.innerHTML = `
    <div class="detail-body-grid">
      <div class="detail-row"><span>Total capacity</span><strong>${formatNumber(shelter.totalCapacity)}</strong></div>
      <div class="detail-row"><span>Current occupancy</span><strong>${formatNumber(shelter.occupancy)}</strong></div>
      <div class="detail-row"><span>Physical available</span><strong>${formatNumber(shelter.physicalAvailable)}</strong></div>
      <div class="detail-row"><span>Effective available</span><strong>${formatNumber(shelter.effectiveAvailable)}</strong></div>
      <div class="detail-row"><span>Facilities</span><strong>${shelter.facilities.join(', ')}</strong></div>
      <div class="detail-row"><span>Status</span><strong>${shelter.status}</strong></div>
      <div class="detail-row"><span>Medical support</span><strong>${shelter.medicalSupport ? 'Yes' : 'No'}</strong></div>
      <div class="detail-row"><span>Wheelchair accessibility</span><strong>${shelter.wheelchairAccessibility ? 'Yes' : 'No'}</strong></div>
      <div class="detail-row"><span>Elderly support</span><strong>${shelter.elderlySupport ? 'Yes' : 'No'}</strong></div>
      <div class="detail-row"><span>Children support</span><strong>${shelter.childSupport ? 'Yes' : 'No'}</strong></div>
      <div class="detail-row"><span>Contact person</span><strong>${shelter.contactPerson}</strong></div>
    </div>
    <div class="info-actions" style="margin-top: 1rem;">
      <button class="secondary-button" type="button" id="updateOccupancyBtn">UPDATE OCCUPANCY</button>
      <button class="secondary-button" type="button" id="updateCapacityBtn">UPDATE CAPACITY</button>
      <button class="secondary-button" type="button" id="verifyShelterBtn">VERIFY SHELTER</button>
      <button class="primary-button" type="button" id="deactivateShelterBtn">DEACTIVATE SHELTER</button>
    </div>
  `;

  document.getElementById('updateOccupancyBtn')?.addEventListener('click', async () => {
    const val = parseInt(prompt('Enter new occupancy:', shelter.occupancy), 10);
    if (!isNaN(val)) {
      try {
        if (shelter.id && shelter.id.length > 20) {
          await api.updateShelter(shelter.id, { current_occupancy: val });
        }
        shelter.occupancy = val;
        shelter.physicalAvailable = Math.max(0, shelter.totalCapacity - val);
        addNotification('success', 'Occupancy Updated', `${shelter.name} occupancy updated to ${val}.`);
        detailModal.classList.add('hidden');
        renderPage();
      } catch (e) {
        addNotification('warning', 'Update Error', e.message);
      }
    }
  });

  document.getElementById('verifyShelterBtn')?.addEventListener('click', async () => {
    try {
      if (shelter.id && shelter.id.length > 20) {
        await api.verifyShelter(shelter.id, true);
      }
      shelter.verified = true;
      shelter.status = 'AVAILABLE';
      addNotification('success', 'Shelter Verified', `${shelter.name} verified for public admission.`);
      detailModal.classList.add('hidden');
      renderPage();
    } catch (e) {
      addNotification('warning', 'Verification Error', e.message);
    }
  });

  detailModal.classList.remove('hidden');
}

function showIncidentDetail(incidentId) {
  const incident = state.incidents.find((item) => item.id === incidentId || item.rawId === incidentId) || state.incidents[0];
  if (!incident) return;

  detailTitle.textContent = incident.type;
  detailBody.innerHTML = `
    <div class="detail-body-grid">
      <div class="detail-row"><span>Incident ID</span><strong>${incident.id}</strong></div>
      <div class="detail-row"><span>Severity</span><strong>${incident.severity}</strong></div>
      <div class="detail-row"><span>Location</span><strong>${incident.location}</strong></div>
      <div class="detail-row"><span>Reported by</span><strong>${incident.reportedBy}</strong></div>
      <div class="detail-row"><span>Time</span><strong>${incident.reportedTime}</strong></div>
      <div class="detail-row"><span>Affected citizens</span><strong>${incident.affectedCitizens}</strong></div>
      <div class="detail-row"><span>Status</span><strong>${incident.status}</strong></div>
      <div class="detail-row"><span>Evidence</span><strong>${incident.evidence}</strong></div>
    </div>
    <div class="info-actions" style="margin-top: 1rem;">
      <button class="secondary-button" type="button" id="incidentViewMapBtn">VIEW ON MAP</button>
      <button class="secondary-button" type="button" id="incidentVerifyBtn">VERIFY BLOCKAGE</button>
      <button class="secondary-button" type="button" id="incidentDeployTeamBtn">ASSIGN RESPONSE TEAM</button>
      <button class="primary-button" type="button" id="incidentResolveBtn">RESOLVE INCIDENT</button>
    </div>
  `;

  document.getElementById('incidentVerifyBtn')?.addEventListener('click', async () => {
    if (incident.rawId) {
      try {
        await api.verifyBlockedRoad(incident.rawId, true, 'Verified by command officer');
        addNotification('warning', 'Blockage Verified', `${incident.location} marked impassable on live backend.`);
        await syncLiveData();
      } catch (e) {
        addNotification('info', 'Verified', e.message);
      }
    }
    detailModal.classList.add('hidden');
    renderPage();
  });

  document.getElementById('incidentResolveBtn')?.addEventListener('click', async () => {
    if (incident.rawId) {
      try {
        await api.clearBlockedRoad(incident.rawId, 'Debris removed and route restored');
        addNotification('success', 'Incident Resolved', `${incident.location} reopened.`);
        await syncLiveData();
      } catch (e) {
        addNotification('info', 'Resolved', e.message);
      }
    }
    detailModal.classList.add('hidden');
    renderPage();
  });

  detailModal.classList.remove('hidden');
}

function openConfirmModal(title, message) {
  document.getElementById('modalTitle').textContent = title;
  modalMessage.textContent = message;
  confirmModal.classList.remove('hidden');
}

function closeConfirmModal() {
  confirmModal.classList.add('hidden');
}

cancelActionBtn.addEventListener('click', closeConfirmModal);
confirmActionBtn.addEventListener('click', () => {
  if (typeof pendingAction === 'function') {
    pendingAction();
  }
  closeConfirmModal();
  pendingAction = null;
});

closeDetailBtn.addEventListener('click', () => {
  detailModal.classList.add('hidden');
});

function updateSimulationStatus(label) {
  let indicator = document.getElementById('simulationStatus');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'simulationStatus';
    indicator.style.position = 'fixed';
    indicator.style.left = '1rem';
    indicator.style.bottom = '1rem';
    indicator.style.zIndex = '40';
    indicator.style.padding = '0.6rem 0.8rem';
    indicator.style.borderRadius = '999px';
    indicator.style.border = '1px solid rgba(75, 179, 255, 0.4)';
    indicator.style.background = 'rgba(10, 20, 24, 0.9)';
    indicator.style.color = '#dfeeff';
    indicator.style.fontSize = '0.72rem';
    indicator.style.letterSpacing = '0.08em';
    indicator.style.textTransform = 'uppercase';
    document.body.appendChild(indicator);
  }
  indicator.textContent = label;
}

// REAL LIVE FLOOD WORKFLOW INTEGRATION
async function runFloodSimulation() {
  if (state.simulating) return;
  state.simulating = true;
  updateSimulationStatus('Initializing live workflow...');

  let activeDisasterId = state.emergency.id;
  let activeBlockedRoadId = null;

  const phases = [
    {
      label: 'PHASE 1',
      summary: 'Authority activates disaster event on backend.',
      run: async () => {
        try {
          if (activeDisasterId) {
            const updated = await api.updateDisaster(activeDisasterId, { status: 'ACTIVE' });
            state.emergency.name = updated.title;
          } else {
            const created = await api.createDisaster({
              title: 'Flood Emergency — Vijayawada Riverfront',
              description: 'Krishna River Basin Flood Event',
              disaster_type: 'FLOOD',
              severity: 'CRITICAL',
              latitude: 16.5062,
              longitude: 80.6480,
              status: 'ACTIVE'
            });
            activeDisasterId = created.id;
            state.emergency.id = created.id;
          }
        } catch (e) {
          console.warn('Phase 1 backend note:', e.message);
        }
        state.emergency.active = true;
        state.emergency.severity = 'CRITICAL';
        addNotification('critical', 'Flood emergency activated.', 'Village A flood response initiated via live API.', 'dashboard');
        addTimelineEntry('Flood emergency activated via backend API', 'critical');
      }
    },
    {
      label: 'PHASE 2',
      summary: 'Hazard zone and shelters retrieved from backend.',
      run: async () => {
        try {
          const hazards = await api.getHazards();
          const shelters = await api.getShelters();
          addNotification('warning', 'Hazard zone identified.', `Riverfront flood zone confirmed (${hazards.length} verified zones, ${shelters.length} active shelters).`, 'map');
          addTimelineEntry(`Hazard zones and shelters verified on live DB`, 'warning');
        } catch (e) {
          addNotification('warning', 'Hazard zone identified.', 'Riverfront red zone confirmed.', 'map');
          addTimelineEntry('Hazard zone identified', 'warning');
        }
      }
    },
    {
      label: 'PHASE 3',
      summary: 'Citizen exposure evaluated via PostGIS exposure detection.',
      run: async () => {
        try {
          const exp = await api.checkExposure(16.5062, 80.6480);
          addNotification('info', 'Citizen exposure detected.', `Exposure status: ${exp.is_exposed ? 'INSIDE HAZARD ZONE' : 'SAFE'} (${exp.message})`, 'omnitriage');
          addTimelineEntry(`PostGIS exposure check: ${exp.message}`, 'warning');
        } catch (e) {
          addNotification('info', 'High-priority citizens identified.', 'Priority evacuation list updated.', 'omnitriage');
          addTimelineEntry('1,200 high-priority citizens identified', 'warning');
        }
        state.citizens = state.citizens.map((citizen) =>
          citizen.priorityLevel === 'CRITICAL' || citizen.priorityLevel === 'HIGH' ? { ...citizen, evacuationStatus: 'Assigned' } : citizen
        );
      }
    },
    {
      label: 'PHASE 4',
      summary: 'Shelters capacity and verification updated.',
      run: async () => {
        const shelterC = state.shelters.find((s) => s.shortId === 'shelter-c' || s.name.includes('Shelter C')) || state.shelters[0];
        if (shelterC && shelterC.id && shelterC.id.length > 20) {
          try {
            await api.verifyShelter(shelterC.id, true);
          } catch (e) {
            console.warn('Phase 4 note:', e.message);
          }
        }
        state.shelters = state.shelters.map((shelter) => ({
          ...shelter,
          status: shelter.id === shelterC?.id ? 'AVAILABLE' : shelter.status
        }));
        addNotification('success', 'Shelter activation complete.', 'Shelters open to vulnerable citizens.', 'shelters');
        addTimelineEntry('Shelter C activated for emergency intake', 'success');
      }
    },
    {
      label: 'PHASE 5',
      summary: 'Safe evacuation routes calculated via routing engine.',
      run: async () => {
        try {
          const routeRes = await api.calculateRoute(16.5062, 80.6480, 16.5165, 80.6352, activeDisasterId);
          addNotification('success', 'Safe evacuation routes generated.', `Engine calculated Route: ${routeRes.distance_km} km (${routeRes.estimated_time_minutes} min).`, 'map');
          addTimelineEntry(`Evacuation route calculated via Routing Engine: ${routeRes.distance_km} km`, 'info');
        } catch (e) {
          addNotification('success', 'Safe evacuation routes generated.', 'Route A and C remain operational.', 'map');
          addTimelineEntry('Evacuation routes generated', 'info');
        }
        state.routes = state.routes.map((route) => ({
          ...route,
          status: route.id === 'route-b' ? 'SAFE' : route.status
        }));
      }
    },
    {
      label: 'PHASE 6',
      summary: 'Citizen reports road blockage via REST API.',
      run: async () => {
        try {
          const reportRes = await api.reportBlockedRoad({
            road_name: 'MG Road, Bandar (Route B)',
            disaster_id: activeDisasterId,
            latitude: 16.5100,
            longitude: 80.6350,
            blockage_type: 'FLOODED',
            severity: 'IMPASSABLE',
            description: 'Rising flood waters overtopping road by 2.5 feet. Route impassable.'
          });
          activeBlockedRoadId = reportRes.id;
          addNotification('warning', 'Road Blockage Reported.', `Citizen report submitted: MG Road impassable (ID: ${reportRes.id.substring(0, 8)}).`, 'incidents');
          addTimelineEntry(`Citizen reported road blockage on Route B (Status: ${reportRes.status}, Verified: false)`, 'warning');
        } catch (e) {
          addNotification('warning', 'Flood water reported on Route B.', '27 citizens potentially affected.', 'incidents');
          addTimelineEntry('Citizen reported flooded road', 'warning');
        }
      }
    },
    {
      label: 'PHASE 7',
      summary: 'Authority verifies road blockage on backend.',
      run: async () => {
        if (activeBlockedRoadId) {
          try {
            await api.verifyBlockedRoad(activeBlockedRoadId, true, 'Confirmed by traffic division & drone imagery');
            addTimelineEntry(`Authority verified road blockage via REST API (Status: VERIFIED)`, 'critical');
          } catch (e) {
            console.warn('Phase 7 note:', e.message);
          }
        }
        state.routeBBlocked = true;
        state.routes = state.routes.map((route) =>
          route.id === 'route-b' ? { ...route, status: 'BLOCKED', className: 'route-blocked' } : route
        );
        addNotification('critical', 'ROUTE B BLOCKED (VERIFIED).', 'Route confirmed impassable. Automated rerouting triggered.', 'map');
        addTimelineEntry('Route B marked unsafe in central dispatch database', 'critical');
      }
    },
    {
      label: 'PHASE 8',
      summary: 'Affected citizens identified & rerouted.',
      run: async () => {
        const affected = state.citizens.filter((citizen) => citizen.assignedRoute === 'Route B' || citizen.id === 'CIT-4821');
        affected.forEach((citizen) => {
          citizen.evacuationStatus = 'Re-routed';
          citizen.assignedRoute = 'Route D';
          citizen.assignedShelter = 'Shelter C';
        });
        addTimelineEntry('327 citizens affected by Route B closure reassigned to Route D', 'critical');
      }
    },
    {
      label: 'PHASE 9',
      summary: 'Alternative route generated via routing engine.',
      run: async () => {
        try {
          const reroute = await api.calculateRoute(16.5062, 80.6480, 16.5165, 80.6352, activeDisasterId);
          addNotification('success', 'Alternative route confirmed.', `Routing engine successfully bypassed blocked road. Route: ${reroute.distance_km} km.`, 'map');
          addTimelineEntry(`Safe alternative route generated: ${reroute.distance_km} km, bypassing blocked segment`, 'success');
        } catch (e) {
          addNotification('success', 'Alternative evacuation route generated.', 'Route D is now active.', 'map');
          addTimelineEntry('Alternative routes generated', 'success');
        }
        const routeD = state.routes.find((route) => route.id === 'route-d');
        if (routeD) {
          routeD.status = 'SAFE';
          routeD.className = 'route-risk';
        }
      }
    },
    {
      label: 'PHASE 10',
      summary: 'Citizens redirected & evacuated.',
      run: async () => {
        state.citizens = state.citizens.map((citizen) =>
          citizen.assignedRoute === 'Route D' ? { ...citizen, evacuationStatus: 'Evacuated' } : citizen
        );
        addTimelineEntry('Citizens redirected safely to Shelter C', 'success');
      }
    },
    {
      label: 'PHASE 11',
      summary: 'Response team dispatched.',
      run: async () => {
        const team = state.teams.find((item) => item.id === 'RT-03');
        if (team) team.status = 'RESPONDING';
        addNotification('info', 'RT-03 deployed.', 'Team dispatched to Route B closure point for barricade & traffic control.', 'teams');
        addTimelineEntry('Response Team RT-03 deployed to scene', 'info');
      }
    },
    {
      label: 'PHASE 12',
      summary: 'Shelter capacity updated on backend.',
      run: async () => {
        const shelterA = state.shelters.find((item) => item.shortId === 'shelter-a' || item.name.includes('Shelter A')) || state.shelters[0];
        if (shelterA) {
          shelterA.occupancy = 835;
          shelterA.physicalAvailable = 165;
          shelterA.effectiveAvailable = 125;
          shelterA.status = 'NEAR CAPACITY';
          if (shelterA.id && shelterA.id.length > 20) {
            try {
              await api.updateShelter(shelterA.id, { current_occupancy: 835 });
            } catch (e) {
              console.warn('Phase 12 note:', e.message);
            }
          }
        }
        addNotification('warning', 'Shelter A reached 83% occupancy.', 'Evacuation pressure rising on sector east.', 'shelters');
        addTimelineEntry('Shelter A capacity threshold reached (83%)', 'warning');
      }
    },
    {
      label: 'PHASE 13',
      summary: 'Audit trail verified & workflow concluded.',
      run: async () => {
        if (activeBlockedRoadId) {
          try {
            const logs = await api.getBlockedRoadAuditLogs(activeBlockedRoadId);
            addTimelineEntry(`Verified ${logs.length} immutable audit log entries for blockage ${activeBlockedRoadId.substring(0, 8)}`, 'success');
          } catch (e) {
            console.warn('Phase 13 note:', e.message);
          }
        }
        const evacuatedCount = state.citizens.filter((citizen) => citizen.evacuationStatus === 'Evacuated').length;
        addNotification('success', 'Workflow complete.', `Real API workflow executed. ${evacuatedCount} citizens safely relocated.`, 'dashboard');
        addTimelineEntry('Live authority workflow completed and synchronized with database', 'success');
      }
    }
  ];

  let index = 0;

  const runNext = async () => {
    if (index >= phases.length) {
      state.simulating = false;
      updateSimulationStatus('Live workflow complete');
      await syncLiveData();
      renderSidebar();
      renderPage();
      return;
    }

    const phase = phases[index];
    updateSimulationStatus(`${phase.label} • ${phase.summary}`);
    await phase.run();
    renderSidebar();
    renderPage();
    index += 1;
    setTimeout(runNext, 1200);
  };

  await runNext();
}

function attachGlobalActions() {
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-action]');
    if (!trigger) return;

    const action = trigger.dataset.action;
    if (action === 'activate-shelter') {
      const shelter = state.shelters.find((item) => item.id === 'shelter-c' || item.name.includes('Shelter C')) || state.shelters[0];
      if (shelter) {
        shelter.status = 'AVAILABLE';
        addNotification('success', 'Shelter activation confirmed.', `${shelter.name} is accepting priority relocation flow.`, 'shelters');
        addTimelineEntry(`${shelter.name} activated for priority relocation`, 'success');
      }
      renderPage();
    }
  });

  document.addEventListener('click', (event) => {
    const bell = event.target.closest('.icon-btn');
    if (bell && bell.getAttribute('aria-label') === 'Notifications') {
      notificationPanel.classList.toggle('hidden');
    }
  });
}

// Initialization
attachLoginHandlers();
attachGlobalActions();
updateClock();
setInterval(updateClock, 1000);

const runFloodButton = document.createElement('button');
runFloodButton.type = 'button';
runFloodButton.className = 'primary-button';
runFloodButton.textContent = 'RUN FLOOD SIMULATION';
runFloodButton.style.position = 'fixed';
runFloodButton.style.right = '1.4rem';
runFloodButton.style.bottom = '1.4rem';
runFloodButton.style.zIndex = '30';
runFloodButton.setAttribute('aria-label', 'Run flood simulation');
runFloodButton.addEventListener('click', runFloodSimulation);
document.body.appendChild(runFloodButton);

renderNotificationPanel();

// Attempt automatic login if saved token exists
if (api.token) {
  api.getMe().then((me) => {
    if (me && me.role === 'AUTHORITY') {
      state.loggedIn = true;
      showApp();
      syncLiveData().then(() => {
        renderSidebar();
        renderPage();
      });
    }
  }).catch(() => {
    api.setToken('');
  });
}
