'use client';

import { CircleMarker, Popup } from 'react-leaflet';
import type { IncidentReport } from '@/types';

interface IncidentLayerProps {
  incidents: IncidentReport[];
  onIncidentClick?: (incident: IncidentReport) => void;
}

type StatusStyle = { color: string; fillColor: string; radius: number };

const STATUS_STYLE: Record<string, StatusStyle> = {
  new:        { color: '#b91c1c', fillColor: '#ef4444', radius: 10 },
  critical:   { color: '#b91c1c', fillColor: '#ef4444', radius: 10 },
  reviewing:  { color: '#c2410c', fillColor: '#f97316', radius: 8 },
  assigned:   { color: '#1d4ed8', fillColor: '#3b82f6', radius: 8 },
  resolved:   { color: '#374151', fillColor: '#6b7280', radius: 6 },
};

function getStatusStyle(status: string): StatusStyle {
  return STATUS_STYLE[status] ?? STATUS_STYLE.reviewing;
}

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

export default function IncidentLayer({ incidents, onIncidentClick }: IncidentLayerProps) {
  if (!incidents || incidents.length === 0) return null;

  const visible = incidents.filter((i) => i.status !== 'resolved' && i.location !== null);

  return (
    <>
      {visible.map((incident) => {
        const style = getStatusStyle(incident.status);
        const truncatedDesc =
          incident.description && incident.description.length > 120
            ? incident.description.slice(0, 120) + '…'
            : incident.description;

        return (
          <CircleMarker
            key={incident.id}
            center={[incident.location!.lat, incident.location!.lng]}
            radius={style.radius}
            pathOptions={{
              color:       style.color,
              fillColor:   style.fillColor,
              fillOpacity: 0.85,
              weight:      2,
            }}
            eventHandlers={{ click: () => onIncidentClick?.(incident) }}
          >
            <Popup>
              <div style={{ minWidth: 180 }}>
                <p style={{ fontWeight: 600, color: '#1e293b', textTransform: 'capitalize', marginBottom: 4 }}>
                  {incident.type.replace(/_/g, ' ')}
                </p>
                <span style={{
                  display: 'inline-block',
                  borderRadius: 4,
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'white',
                  backgroundColor: style.fillColor,
                  textTransform: 'capitalize',
                  marginBottom: 6,
                }}>
                  {incident.status}
                </span>
                {truncatedDesc && (
                  <p style={{ fontSize: '0.813rem', color: '#475569', marginBottom: 4 }}>
                    {truncatedDesc}
                  </p>
                )}
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {formatTimestamp(String(incident.reportedAt.toString().toString()))}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}
