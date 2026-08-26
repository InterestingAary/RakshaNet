'use client';

import { Polygon, Popup } from 'react-leaflet';
import type { HazardZone } from '@/types';

interface HazardLayerProps {
  zones: HazardZone[];
}

const SEVERITY_STYLE: Record<
  HazardZone['severity'],
  { fillColor: string; fillOpacity: number; color: string }
> = {
  critical: { fillColor: '#ef4444', fillOpacity: 0.4, color: '#b91c1c' },
  high:     { fillColor: '#f97316', fillOpacity: 0.35, color: '#c2410c' },
  medium:   { fillColor: '#eab308', fillOpacity: 0.3,  color: '#a16207' },
  low:      { fillColor: '#3b82f6', fillOpacity: 0.2,  color: '#1d4ed8' },
};

const SEVERITY_LABEL: Record<HazardZone['severity'], string> = {
  critical: 'Critical',
  high:     'High',
  medium:   'Medium',
  low:      'Low',
};

export default function HazardLayer({ zones }: HazardLayerProps) {
  if (!zones || zones.length === 0) return null;

  return (
    <>
      {zones.map((zone) => {
        const style = SEVERITY_STYLE[zone.severity] ?? SEVERITY_STYLE.low;
        return (
          <Polygon
            key={zone.id}
            positions={zone.polygon}
            pathOptions={{
              fillColor:   style.fillColor,
              fillOpacity: style.fillOpacity,
              color:       style.color,
              weight:      2,
            }}
          >
            <Popup>
              <div style={{ minWidth: '160px' }}>
                <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
                  {zone.name}
                </p>
                <p style={{ fontSize: '0.813rem', color: '#475569', marginBottom: 6 }}>
                  Type: {zone.type.replace(/_/g, ' ')}
                </p>
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
                  {SEVERITY_LABEL[zone.severity]} Severity
                </span>
                {zone.description && (
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 6 }}>
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
