'use client';

import { CircleMarker, Popup } from 'react-leaflet';
import type { IncidentReport } from '@/types';

interface BlockedRoadLayerProps {
  incidents: IncidentReport[];
}

const BLOCKED_TYPES = new Set(['road_blocked', 'flooded_route']);

function formatTimestamp(ts: string): string {
  try {
    return new Date(ts).toLocaleString('en-IN', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return ts;
  }
}

export default function BlockedRoadLayer({ incidents }: BlockedRoadLayerProps) {
  if (!incidents || incidents.length === 0) return null;

  const blockedIncidents = incidents.filter(
    (i) => BLOCKED_TYPES.has(i.type) && i.status !== 'resolved' && i.location !== null,
  );

  if (blockedIncidents.length === 0) return null;

  return (
    <>
      {blockedIncidents.map((incident) => (
        <CircleMarker
          key={`blocked-${incident.id}`}
          center={[incident.location!.lat, incident.location!.lng]}
          radius={12}
          pathOptions={{
            color:       '#991b1b',
            fillColor:   '#ef4444',
            fillOpacity: 0.9,
            weight:      3,
          }}
        >
          <Popup>
            <div style={{ minWidth: 180 }}>
              <p style={{ fontWeight: 700, color: '#991b1b', marginBottom: 4 }}>
                🚫 Road Blocked
              </p>
              <p style={{
                fontSize: '0.813rem',
                color: '#475569',
                textTransform: 'capitalize',
                marginBottom: 4,
              }}>
                {incident.type.replace(/_/g, ' ')}
              </p>
              {incident.description && (
                <p style={{ fontSize: '0.813rem', color: '#475569', marginBottom: 4 }}>
                  {incident.description}
                </p>
              )}
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Reported: {formatTimestamp(String(incident.reportedAt.toString().toString()))}
              </p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}
