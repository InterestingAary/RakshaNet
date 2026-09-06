'use client';

import { CircleMarker, Popup } from 'react-leaflet';
import type { IncidentReport, BlockedRoad } from '@/types';

interface BlockedRoadLayerProps {
  blockedRoads?: BlockedRoad[];
  incidents?: IncidentReport[];
}

const BLOCKED_TYPES = new Set(['road_blocked', 'flooded_route']);

function formatTimestamp(ts: string | Date | null | undefined): string {
  if (!ts) return 'N/A';
  try {
    return new Date(ts).toLocaleString('en-IN', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return String(ts);
  }
}

function getSeverityColor(severity: string): { border: string; fill: string } {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return { border: '#7f1d1d', fill: '#dc2626' };
    case 'high':
      return { border: '#991b1b', fill: '#ef4444' };
    case 'medium':
      return { border: '#c2410c', fill: '#f97316' };
    case 'low':
      return { border: '#a16207', fill: '#eab308' };
    default:
      return { border: '#991b1b', fill: '#ef4444' };
  }
}

export default function BlockedRoadLayer({
  blockedRoads = [],
  incidents = [],
}: BlockedRoadLayerProps) {
  // If first-class verified blocked roads exist, render them
  const hasBlockedRoads = Array.isArray(blockedRoads) && blockedRoads.length > 0;

  // Fallback to incidents if no verified blocked roads are passed
  const fallbackIncidents = !hasBlockedRoads
    ? incidents.filter(
        (i) =>
          BLOCKED_TYPES.has(i.type) &&
          i.status !== 'resolved' &&
          i.location !== null
      )
    : [];

  if (!hasBlockedRoads && fallbackIncidents.length === 0) return null;

  return (
    <>
      {hasBlockedRoads &&
        blockedRoads.map((road) => {
          const colors = getSeverityColor(road.severity);
          return (
            <CircleMarker
              key={`verified-blocked-${road.id}`}
              center={[road.latitude, road.longitude]}
              radius={13}
              pathOptions={{
                color: colors.border,
                fillColor: colors.fill,
                fillOpacity: 0.9,
                weight: 3,
              }}
            >
              <Popup>
                <div style={{ minWidth: 200, fontFamily: 'sans-serif' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        color: '#991b1b',
                        fontSize: '0.9rem',
                      }}
                    >
                      ⛔ Road Blocked
                    </span>
                    <span
                      style={{
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        border: '1px solid #bbf7d0',
                      }}
                    >
                      ✓ VERIFIED
                    </span>
                  </div>

                  <div style={{ marginBottom: 6 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        padding: '1px 5px',
                        borderRadius: 3,
                        backgroundColor: '#fee2e2',
                        color: '#991b1b',
                        marginRight: 6,
                      }}
                    >
                      {road.blockage_type.replace(/_/g, ' ')}
                    </span>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        padding: '1px 5px',
                        borderRadius: 3,
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                      }}
                    >
                      {road.severity} severity
                    </span>
                  </div>

                  {road.description && (
                    <p
                      style={{
                        fontSize: '0.813rem',
                        color: '#334155',
                        marginBottom: 6,
                        lineHeight: 1.4,
                      }}
                    >
                      {road.description}
                    </p>
                  )}

                  <div
                    style={{
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: 4,
                      marginTop: 4,
                      fontSize: '0.7rem',
                      color: '#64748b',
                    }}
                  >
                    {road.verified_at && (
                      <div>Verified: {formatTimestamp(road.verified_at)}</div>
                    )}
                    <div>Reported: {formatTimestamp(road.created_at)}</div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

      {fallbackIncidents.map((incident) => (
        <CircleMarker
          key={`blocked-incident-${incident.id}`}
          center={[incident.location!.lat, incident.location!.lng]}
          radius={12}
          pathOptions={{
            color: '#991b1b',
            fillColor: '#ef4444',
            fillOpacity: 0.9,
            weight: 3,
          }}
        >
          <Popup>
            <div style={{ minWidth: 180 }}>
              <p
                style={{
                  fontWeight: 700,
                  color: '#991b1b',
                  marginBottom: 4,
                }}
              >
                🚫 Road Blocked
              </p>
              <p
                style={{
                  fontSize: '0.813rem',
                  color: '#475569',
                  textTransform: 'capitalize',
                  marginBottom: 4,
                }}
              >
                {incident.type.replace(/_/g, ' ')}
              </p>
              {incident.description && (
                <p
                  style={{
                    fontSize: '0.813rem',
                    color: '#475569',
                    marginBottom: 4,
                  }}
                >
                  {incident.description}
                </p>
              )}
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Reported: {formatTimestamp(incident.reportedAt)}
              </p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}
