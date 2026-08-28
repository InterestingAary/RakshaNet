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

const initialState = {
  loggedIn: false,
  currentPage: 'dashboard',
  emergencyActive: true,
  selectedMarker: 'shelter-a',
  mapLayer: 'all',
  routeBBlocked: false,
  simulating: false,
  emergency: {
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
let simulationTimer = null;

function formatNumber(value) {
  return new Intl.NumberFormat('en-IN').format(value);
}

function getKpis() {
  const evacuated = state.citizens.filter((citizen) => citizen.evacuationStatus === 'Evacuated').length || 4500;
  const affectedPopulation = state.emergency.affectedPopulation || 8000;
  const highPriorityCitizens = state.citizens.filter((citizen) => ['CRITICAL', 'HIGH'].includes(citizen.priorityLevel)).length || 1200;
  const activeShelters = state.shelters.filter((shelter) => shelter.status !== 'INACTIVE').length || 8;
  const blockedRoutes = state.routes.filter((route) => route.status === 'BLOCKED').length || 2;
  const criticalIncidents = state.incidents.filter((incident) => incident.severity === 'CRITICAL' || incident.status === 'CRITICAL').length || 6;
  const activeTeams = state.teams.filter((team) => team.status !== 'COMPLETED').length || 17;
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

function addTimelineEntry(text, severity = 'info') {
  state.timeline.unshift({
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

function showApp() {
  loginView.classList.add('hidden');
  appView.classList.remove('hidden');
  renderSidebar();
  renderPage();
  renderNotificationPanel();
}

function attachLoginHandlers() {
  document.getElementById('loginForm').addEventListener('submit', (event) => {
    event.preventDefault();
    state.loggedIn = true;
    showApp();
  });

  document.getElementById('demoModeBtn').addEventListener('click', () => {
    state.loggedIn = true;
    showApp();
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
          <div class="kpi-value">${kpi.value}${kpi.value % 1 !== 0 ? '' : ''}${kpi.key === 'evacuationProgress' ? '%' : ''}</div>
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
                    <td><span class="badge ${shelter.status === 'AVAILABLE' ? 'safe' : shelter.status === 'CRITICAL' || shelter.status === 'FULL' ? 'danger' : 'warning'}">${shelter.status}</span></td>
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
          <form class="event-form">
            <div class="form-field">
              <label>Event name</label>
              <input value="${state.emergency.name}" />
            </div>
            <div class="form-field">
              <label>Disaster type</label>
              <select>
                <option selected>${state.emergency.type}</option>
                <option>Cyclone</option>
                <option>Landslide</option>
                <option>Other</option>
              </select>
            </div>
            <div class="form-field">
              <label>Severity</label>
              <select>
                <option>Low</option>
                <option>Moderate</option>
                <option>High</option>
                <option selected>${state.emergency.severity}</option>
              </select>
            </div>
            <div class="form-field">
              <label>Start date/time</label>
              <input value="2026-08-26 21:00" />
            </div>
            <div class="form-field">
              <label>Affected region</label>
              <input value="${state.emergency.region}" />
            </div>
            <div class="form-field">
              <label>Estimated affected population</label>
              <input value="${state.emergency.affectedPopulation}" />
            </div>
            <div class="form-field">
              <label>Hazard zone</label>
              <input value="${state.emergency.hazardZone}" />
            </div>
            <div class="form-field">
              <label>Official emergency instructions</label>
              <input value="${state.emergency.officialInstructions}" />
            </div>
            <div class="form-field full">
              <label>Operational description</label>
              <textarea>Severe rainfall and rising river levels are threatening low-lying settlement blocks. Priority relocation and route reassessment required immediately.</textarea>
            </div>
            <div class="form-footer full">
              <button type="button" class="primary-button">Save event</button>
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
          <button class="primary-button" type="button">Register shelter</button>
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
                  <td data-open-detail="shelter:${shelter.id}">${shelter.id.toUpperCase()}</td>
                  <td>${shelter.name}</td>
                  <td>${shelter.location}</td>
                  <td>${formatNumber(shelter.totalCapacity)}</td>
                  <td>${formatNumber(shelter.occupancy)}</td>
                  <td>${formatNumber(shelter.physicalAvailable)}</td>
                  <td>${formatNumber(shelter.effectiveAvailable)}</td>
                  <td><span class="badge ${shelter.status === 'AVAILABLE' ? 'safe' : shelter.status === 'CRITICAL' || shelter.status === 'FULL' ? 'danger' : 'warning'}">${shelter.status}</span></td>
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
          <button class="primary-button" type="button">Assign response team</button>
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
                <button class="primary-button" type="button">View Route</button>
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
          <button class="primary-button" type="button">New report</button>
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
                <span>Citizen: ${incident.reportedBy}</span>
                <span>Location: ${incident.location}</span>
                <span>Reported: ${incident.reportedTime}</span>
                <span>Impact: ${incident.affectedCitizens} citizens</span>
              </div>
              <div class="case-actions">
                <button class="secondary-button" type="button" data-open-detail="incident:${incident.id}">View on map</button>
                <button class="secondary-button" type="button">Mark unsafe</button>
                <button class="secondary-button" type="button">Recalculate routes</button>
                <button class="primary-button" type="button">Deploy team</button>
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
          <button class="primary-button" type="button">Deploy team</button>
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
          <button class="ghost-button" type="button">Sync logs</button>
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
  const critical = kpis.find((item) => item.key === 'criticalIncidents')?.value ?? 6;
  const averageOccupancy = Math.round((state.shelters.reduce((sum, shelter) => sum + (shelter.occupancy / shelter.totalCapacity) * 100, 0) / state.shelters.length) * 10) / 10;

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
              <div class="info-row"><span>Route B reroute</span><strong>${state.citizens.filter((citizen) => citizen.assignedRoute === 'Route D').length} affected</strong></div>
              <div class="info-row"><span>Deployments</span><strong>${kpis.find((item) => item.key === 'activeTeams')?.value ?? 17} active</strong></div>
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
      pendingAction = () => {
        state.emergencyActive = true;
        addNotification('success', 'Emergency activated.', 'Flood response operations have been initiated.', 'dashboard');
        addTimelineEntry('Emergency activation confirmed', 'critical');
        state.currentPage = 'dashboard';
        renderSidebar();
        renderPage();
      };
      openConfirmModal(`${label}?`, 'This action will immediately update the operational response state for the active disaster event.');
    });
  });

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
    button.addEventListener('click', () => {
      const shelter = state.shelters.find((item) => item.id === 'shelter-c');
      if (shelter) {
        shelter.status = 'AVAILABLE';
        addNotification('success', 'Shelter activation confirmed.', 'Shelter C is accepting priority relocation flow.', 'shelters');
        addTimelineEntry('Shelter C activated for priority relocation', 'success');
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
  const citizen = state.citizens.find((item) => item.id === citizenId);
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
      <button class="secondary-button" type="button">VIEW ON MAP</button>
      <button class="secondary-button" type="button">ASSIGN SHELTER</button>
      <button class="secondary-button" type="button">ASSIGN RESPONSE TEAM</button>
      <button class="primary-button" type="button">VIEW SAFE ROUTE</button>
    </div>
  `;
  detailModal.classList.remove('hidden');
}

function showShelterDetail(shelterId) {
  const shelter = state.shelters.find((item) => item.id === shelterId);
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
      <button class="secondary-button" type="button">UPDATE OCCUPANCY</button>
      <button class="secondary-button" type="button">UPDATE CAPACITY</button>
      <button class="secondary-button" type="button">VIEW ON MAP</button>
      <button class="primary-button" type="button">DEACTIVATE SHELTER</button>
    </div>
  `;
  detailModal.classList.remove('hidden');
}

function showIncidentDetail(incidentId) {
  const incident = state.incidents.find((item) => item.id === incidentId);
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
      <button class="secondary-button" type="button">VIEW ON MAP</button>
      <button class="secondary-button" type="button">MARK CRITICAL</button>
      <button class="secondary-button" type="button">ASSIGN RESPONSE TEAM</button>
      <button class="primary-button" type="button">RESOLVE INCIDENT</button>
    </div>
  `;
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
  const indicator = document.getElementById('simulationStatus');
  if (indicator) {
    indicator.textContent = label;
    return;
  }

  const status = document.createElement('div');
  status.id = 'simulationStatus';
  status.style.position = 'fixed';
  status.style.left = '1rem';
  status.style.bottom = '1rem';
  status.style.zIndex = '40';
  status.style.padding = '0.6rem 0.8rem';
  status.style.borderRadius = '999px';
  status.style.border = '1px solid rgba(75, 179, 255, 0.4)';
  status.style.background = 'rgba(10, 20, 24, 0.9)';
  status.style.color = '#dfeeff';
  status.style.fontSize = '0.72rem';
  status.style.letterSpacing = '0.08em';
  status.style.textTransform = 'uppercase';
  status.textContent = label;
  document.body.appendChild(status);
}

function runFloodSimulation() {
  if (state.simulating) return;
  state.simulating = true;
  updateSimulationStatus('Simulation running');

  const phases = [
    {
      label: 'PHASE 1',
      summary: 'Flood emergency activated.',
      run: () => {
        state.emergency.active = true;
        state.emergency.severity = 'CRITICAL';
        addNotification('critical', 'Flood emergency activated.', 'Village A flood response has been initiated.', 'dashboard');
        addTimelineEntry('Flood emergency activated', 'critical');
      }
    },
    {
      label: 'PHASE 2',
      summary: 'Hazard zone becomes visible.',
      run: () => {
        addNotification('warning', 'Hazard zone identified.', 'Riverfront red zone confirmed.', 'map');
        addTimelineEntry('Hazard zone identified', 'warning');
      }
    },
    {
      label: 'PHASE 3',
      summary: 'High-priority citizens are identified.',
      run: () => {
        state.citizens = state.citizens.map((citizen) => citizen.priorityLevel === 'CRITICAL' || citizen.priorityLevel === 'HIGH' ? { ...citizen, evacuationStatus: 'Assigned' } : citizen);
        addNotification('info', 'High-priority citizens identified.', 'Priority evacuation list updated.', 'omnitriage');
        addTimelineEntry('1,200 high-priority citizens identified', 'warning');
      }
    },
    {
      label: 'PHASE 4',
      summary: 'Shelters become active.',
      run: () => {
        state.shelters = state.shelters.map((shelter) => ({ ...shelter, status: shelter.id === 'shelter-c' ? 'AVAILABLE' : shelter.status }));
        addNotification('success', 'Shelter activation complete.', 'Shelter C and D are open to vulnerable families.', 'shelters');
        addTimelineEntry('Shelter C activated', 'success');
      }
    },
    {
      label: 'PHASE 5',
      summary: 'Safe evacuation routes displayed.',
      run: () => {
        state.routes = state.routes.map((route) => ({ ...route, status: route.id === 'route-b' ? 'SAFE' : route.status }));
        addNotification('success', 'Safe evacuation routes generated.', 'Route A and C remain operational.', 'map');
        addTimelineEntry('Evacuation routes generated', 'info');
      }
    },
    {
      label: 'PHASE 6',
      summary: 'Citizen incident report generated.',
      run: () => {
        const incident = { id: 'INC-482', type: 'Flooded Route', severity: 'CRITICAL', location: 'Main Road, Village A', reportedBy: 'CIT-4821', reportedTime: '21:08', affectedCitizens: 27, status: 'CRITICAL', evidence: 'Road cam footage' };
        state.incidents.unshift(incident);
        addNotification('warning', 'Flood water reported on Route B.', '27 citizens potentially affected.', 'incidents');
        addTimelineEntry('Citizen reported flooded road', 'warning');
      }
    },
    {
      label: 'PHASE 7',
      summary: 'Route B becomes blocked.',
      run: () => {
        state.routeBBlocked = true;
        state.routes = state.routes.map((route) => route.id === 'route-b' ? { ...route, status: 'BLOCKED', className: 'route-blocked' } : route);
        addNotification('critical', 'ROUTE B BLOCKED.', '327 citizens affected. Alternative route generated.', 'map');
        addTimelineEntry('Route B marked unsafe', 'critical');
      }
    },
    {
      label: 'PHASE 8',
      summary: 'Affected citizens identified.',
      run: () => {
        const affected = state.citizens.filter((citizen) => citizen.assignedRoute === 'Route B' || citizen.id === 'CIT-4821');
        affected.forEach((citizen) => {
          citizen.evacuationStatus = 'Re-routed';
          citizen.assignedRoute = 'Route D';
          citizen.assignedShelter = 'Shelter C';
        });
        addTimelineEntry('327 citizens affected', 'critical');
      }
    },
    {
      label: 'PHASE 9',
      summary: 'Alternative route generated.',
      run: () => {
        const routeD = state.routes.find((route) => route.id === 'route-d');
        if (routeD) {
          routeD.status = 'SAFE';
          routeD.className = 'route-risk';
        }
        addNotification('success', 'Alternative evacuation route generated.', 'Route D is now active.', 'map');
        addTimelineEntry('Alternative routes generated', 'success');
      }
    },
    {
      label: 'PHASE 10',
      summary: 'Citizens redirected.',
      run: () => {
        state.citizens = state.citizens.map((citizen) => citizen.assignedRoute === 'Route D' ? { ...citizen, evacuationStatus: 'Evacuated' } : citizen);
        addTimelineEntry('Citizens redirected to Shelter C', 'success');
      }
    },
    {
      label: 'PHASE 11',
      summary: 'Response team deployed.',
      run: () => {
        const team = state.teams.find((item) => item.id === 'RT-03');
        if (team) team.status = 'RESPONDING';
        addNotification('info', 'RT-03 deployed to blocked route response.', 'Evacuation tasks reassigned.', 'teams');
        addTimelineEntry('Response Team RT-03 deployed', 'info');
      }
    },
    {
      label: 'PHASE 12',
      summary: 'Shelter capacity updated.',
      run: () => {
        const shelter = state.shelters.find((item) => item.id === 'shelter-a');
        if (shelter) {
          shelter.occupancy = 835;
          shelter.physicalAvailable = 165;
          shelter.effectiveAvailable = 125;
          shelter.status = 'NEAR CAPACITY';
        }
        addNotification('warning', 'Shelter A reached 83% occupancy.', 'Evacuation pressure rising.', 'shelters');
        addTimelineEntry('Shelter A reached 83% capacity', 'warning');
      }
    },
    {
      label: 'PHASE 13',
      summary: 'Evacuation progress updated.',
      run: () => {
        const evacuatedCount = state.citizens.filter((citizen) => citizen.evacuationStatus === 'Evacuated').length;
        state.emergency.affectedPopulation = 8000;
        addNotification('success', 'Evacuation is progressing.', `${evacuatedCount} citizens relocated to secure shelters.`, 'dashboard');
        addTimelineEntry('Evacuation progress updated', 'success');
      }
    }
  ];

  let index = 0;

  const runNext = () => {
    if (index >= phases.length) {
      state.simulating = false;
      updateSimulationStatus('Simulation complete');
      renderPage();
      return;
    }

    const phase = phases[index];
    updateSimulationStatus(phase.label + ' • ' + phase.summary);
    phase.run();
    renderSidebar();
    renderPage();
    index += 1;
    setTimeout(runNext, 900);
  };

  runNext();
}

function attachGlobalActions() {
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-action]');
    if (!trigger) return;

    const action = trigger.dataset.action;
    if (action === 'activate-shelter') {
      const shelter = state.shelters.find((item) => item.id === 'shelter-c');
      if (shelter) {
        shelter.status = 'AVAILABLE';
        addNotification('success', 'Shelter activation confirmed.', 'Shelter C is accepting priority relocation flow.', 'shelters');
        addTimelineEntry('Shelter C activated for priority relocation', 'success');
      }
      renderPage();
    }
  });

  document.addEventListener('click', (event) => {
    const bell = event.target.closest('.icon-btn');
    if (bell) {
      notificationPanel.classList.toggle('hidden');
    }
  });
}

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
