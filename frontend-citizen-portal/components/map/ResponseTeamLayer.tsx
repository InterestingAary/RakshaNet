'use client';

import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import type { ResponseTeam } from '@/types';

interface ResponseTeamLayerProps {
  teams: ResponseTeam[];
}

type TeamStatus = 'available' | 'assigned' | 'enroute' | 'on_scene' | 'offline';

const STATUS_COLOR: Record<string, string> = {
  available: '#2563eb',
  assigned:  '#ea580c',
  enroute:   '#ea580c',
  on_scene:  '#7c3aed',
  offline:   '#6b7280',
};

const STATUS_LABEL: Record<string, string> = {
  available: 'Available',
  assigned:  'Assigned',
  enroute:   'En Route',
  on_scene:  'On Scene',
  offline:   'Offline',
};

function createTeamIcon(team: ResponseTeam): L.DivIcon {
  const color = STATUS_COLOR[team.status] ?? '#6b7280';
  return L.divIcon({
    html: `<div style="
      background-color:${color};
      width:26px;height:26px;
      border-radius:4px;
      border:2px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;
      color:white;font-weight:700;font-size:11px;
      font-family:system-ui,sans-serif;
    ">T</div>`,
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -15],
  });
}

export default function ResponseTeamLayer({ teams }: ResponseTeamLayerProps) {
  if (!teams || teams.length === 0) return null;

  return (
    <>
      {teams.map((team) => {
        const icon = createTeamIcon(team);
        const statusColor = STATUS_COLOR[team.status] ?? '#6b7280';
        const statusLabel = STATUS_LABEL[team.status] ?? team.status;

        return (
          <Marker
            key={team.id}
            position={[team.location.lat, team.location.lng]}
            icon={icon}
          >
            <Popup>
              <div style={{ minWidth: 160 }}>
                <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
                  {team.name}
                </p>
                <p style={{
                  fontSize: '0.813rem',
                  color: '#475569',
                  textTransform: 'capitalize',
                  marginBottom: 6,
                }}>
                  {team.type.replace(/_/g, ' ')}
                </p>
                <span style={{
                  display: 'inline-block',
                  borderRadius: 4,
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'white',
                  backgroundColor: statusColor,
                }}>
                  {statusLabel}
                </span>
                {team.memberCount != null && (
                  <p style={{ fontSize: '0.813rem', color: '#475569', marginTop: 6 }}>
                    Members: {team.memberCount}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
