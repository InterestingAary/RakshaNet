'use client';

interface MapLegendProps {
  showHazards?: boolean;
  showShelters?: boolean;
  showIncidents?: boolean;
  showRoutes?: boolean;
  showTeams?: boolean;
}

interface LegendItem {
  color: string;
  label: string;
  shape?: 'circle' | 'square' | 'line';
  dash?: boolean;
}

const HAZARD_ITEMS: LegendItem[] = [
  { color: '#ef4444', label: 'Critical Hazard',  shape: 'square' },
  { color: '#f97316', label: 'High Hazard',      shape: 'square' },
  { color: '#eab308', label: 'Medium Hazard',    shape: 'square' },
  { color: '#3b82f6', label: 'Low Hazard',       shape: 'square' },
];

const SHELTER_ITEMS: LegendItem[] = [
  { color: '#22c55e', label: 'Shelter — Available', shape: 'circle' },
  { color: '#f97316', label: 'Shelter — Near Full', shape: 'circle' },
  { color: '#ef4444', label: 'Shelter — Full',      shape: 'circle' },
  { color: '#6b7280', label: 'Shelter — Inactive',  shape: 'circle' },
];

const INCIDENT_ITEMS: LegendItem[] = [
  { color: '#ef4444', label: 'Critical / New',  shape: 'circle' },
  { color: '#f97316', label: 'Under Review',    shape: 'circle' },
  { color: '#3b82f6', label: 'Assigned',        shape: 'circle' },
];

const ROUTE_ITEMS: LegendItem[] = [
  { color: '#16a34a', label: 'Route — Safe',          shape: 'line' },
  { color: '#ea580c', label: 'Route — Caution',       shape: 'line', dash: true },
  { color: '#dc2626', label: 'Route — Blocked',       shape: 'line', dash: true },
  { color: '#ef4444', label: 'Blocked Road',          shape: 'circle' },
];

const TEAM_ITEMS: LegendItem[] = [
  { color: '#2563eb', label: 'Team — Available', shape: 'square' },
  { color: '#ea580c', label: 'Team — En Route',  shape: 'square' },
  { color: '#7c3aed', label: 'Team — On Scene',  shape: 'square' },
];

function ColorSwatch({ item }: { item: LegendItem }) {
  if (item.shape === 'line') {
    return (
      <div style={{
        width: 20,
        height: 3,
        borderRadius: 2,
        flexShrink: 0,
        backgroundImage: item.dash
          ? `repeating-linear-gradient(90deg, ${item.color} 0, ${item.color} 4px, transparent 4px, transparent 7px)`
          : undefined,
        backgroundColor: item.dash ? 'transparent' : item.color,
      }} />
    );
  }
  if (item.shape === 'circle') {
    return (
      <div style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: item.color,
        flexShrink: 0,
        border: '1.5px solid rgba(255,255,255,0.6)',
      }} />
    );
  }
  // square (hazard / team)
  return (
    <div style={{
      width: 12,
      height: 12,
      borderRadius: 2,
      backgroundColor: item.color,
      opacity: 0.75,
      flexShrink: 0,
    }} />
  );
}

function LegendSection({ title, items }: { title: string; items: LegendItem[] }) {
  return (
    <div>
      <p style={{
        fontSize: '0.625rem',
        fontWeight: 700,
        color: '#94a3b8',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 4,
      }}>
        {title}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {items.map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ColorSwatch item={item} />
            <span style={{ fontSize: '0.688rem', color: '#cbd5e1' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MapLegend({
  showHazards = true,
  showShelters = true,
  showIncidents = true,
  showRoutes = true,
  showTeams = false,
}: MapLegendProps) {
  const hasSections =
    showHazards || showShelters || showIncidents || showRoutes || showTeams;
  if (!hasSections) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: 10,
        zIndex: 1000,
        backgroundColor: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 180,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <p style={{
        fontSize: '0.7rem',
        fontWeight: 700,
        color: '#f1f5f9',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        marginBottom: 2,
      }}>
        Legend
      </p>

      {showHazards   && <LegendSection title="Hazard Zones"    items={HAZARD_ITEMS} />}
      {showShelters  && <LegendSection title="Shelters"        items={SHELTER_ITEMS} />}
      {showIncidents && <LegendSection title="Incidents"       items={INCIDENT_ITEMS} />}
      {showRoutes    && <LegendSection title="Routes / Roads"  items={ROUTE_ITEMS} />}
      {showTeams     && <LegendSection title="Response Teams"  items={TEAM_ITEMS} />}
    </div>
  );
}
