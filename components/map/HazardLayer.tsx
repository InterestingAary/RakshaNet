'use client';

import React from 'react';
import { Polygon, Popup } from 'react-leaflet';
import type { HazardZone } from '@/types';
import type { Severity } from '@/types/common';

interface HazardLayerProps {
  zones: HazardZone[];
}

const SEVERITY_STYLE: Record<
  Severity,
  { fillColor: string; fillOpacity: number; color: string }
> = {
  critical: { fillColor: '#ef4444', fillOpacity: 0.4, color: '#b91c1c' },
  high:     { fillColor: '#f97316', fillOpacity: 0.35, color: '#c2410c' },
  medium:   { fillColor: '#eab308', fillOpacity: 0.3,  color: '#a16207' },
  low:      { fillColor: '#3b82f6', fillOpacity: 0.2,  color: '#1d4ed8' },
};

const SEVERITY_LABEL: Record<Severity, string> = {
  critical: 'Critical',
  high:     'High',
  medium:   'Medium',
  low:      'Low',
};

function normalizeSeverity(severity: HazardZone['severity']): Severity {
  if (typeof severity === 'string') {
    const s = severity.toLowerCase();
    if (s === 'critical' || s === 'high' || s === 'medium' || s === 'low') {
      return s as Severity;
    }
  }
  const num = Number(severity);
  if (num >= 5) return 'critical';
  if (num >= 4) return 'high';
  if (num >= 3) return 'medium';
  return 'low';
}

export default function HazardLayer({ zones }: HazardLayerProps) {
  if (!zones || zones.length === 0) return null;

  return (
    <>
      {zones.map((zone) => {
        const sev = normalizeSeverity(zone.severity);
        const style = SEVERITY_STYLE[sev] ?? SEVERITY_STYLE.low;

        // Build Leaflet polygon positions from GeoJSON MultiPolygon or legacy LatLng array
        let positions: [number, number][][] = [];
        if (zone.geometry?.coordinates && Array.isArray(zone.geometry.coordinates)) {
          positions = zone.geometry.coordinates.flatMap((polygon) =>
            Array.isArray(polygon)
              ? polygon.map((ring) =>
                  Array.isArray(ring)
                    ? ring.map(([lon, lat]) => [lat, lon] as [number, number])
                    : []
                )
              : []
          );
        } else if (zone.polygon && Array.isArray(zone.polygon) && zone.polygon.length > 0) {
          positions = [zone.polygon.map((p) => [p.lat, p.lng] as [number, number])];
        }

        if (positions.length === 0) return null;

        return (
          <Polygon
            key={zone.id}
            positions={positions as any}
            pathOptions={{
              fillColor: style.fillColor,
              fillOpacity: style.fillOpacity,
              color: style.color,
              weight: 2,
            }}
          >
            <Popup>
              <div style={{ minWidth: '180px', fontFamily: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <p style={{ fontWeight: 700, color: '#1e293b', margin: 0, fontSize: '0.9rem' }}>
                    {zone.name}
                  </p>
                  {zone.verified !== false && (
                    <span
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        borderRadius: 4,
                        padding: '1px 6px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        marginLeft: 6,
                      }}
                    >
                      ✓ Verified
                    </span>
                  )}
                </div>

                {zone.type && (
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 6px 0' }}>
                    Type: {zone.type.replace(/_/g, ' ')}
                  </p>
                )}

                <div style={{ display: 'flex', gap: 6, alignItems: 'center', margin: '6px 0' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      borderRadius: 4,
                      padding: '2px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'white',
                      backgroundColor: style.color,
                    }}
                  >
                    {SEVERITY_LABEL[sev]} Severity
                  </span>
                </div>

                {zone.source && (
                  <p style={{ fontSize: '0.75rem', color: '#475569', margin: '4px 0', fontStyle: 'italic' }}>
                    Source: {zone.source}
                  </p>
                )}

                {zone.description && (
                  <p style={{ fontSize: '0.75rem', color: '#475569', margin: '6px 0 0 0', lineHeight: 1.3 }}>
                    {zone.description}
                  </p>
                )}
              </div>
            </Popup>
          </Polygon>
        );
      })}
    </>
  );
}

