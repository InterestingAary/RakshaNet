'use client';

import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import type { Shelter } from '@/types';

interface ShelterLayerProps {
  shelters: Shelter[];
  onShelterClick?: (shelter: Shelter) => void;
}

function getShelterColor(shelter: Shelter): string {
  if (shelter.status === 'inactive') return '#6b7280';
  if (shelter.status === 'full') return '#ef4444';
  const pct = shelter.occupancy / shelter.totalCapacity;
  if (pct >= 0.8) return '#f97316';
  return '#22c55e';
}

function getShelterStatusLabel(shelter: Shelter): string {
  if (shelter.status === 'inactive') return 'Inactive';
  if (shelter.status === 'full') return 'Full';
  const pct = shelter.occupancy / shelter.totalCapacity;
  if (pct >= 0.8) return 'Near Full';
  return 'Active';
}

function createShelterIcon(shelter: Shelter): L.DivIcon {
  const color = getShelterColor(shelter);
  return L.divIcon({
    html: `<div style="
      background-color:${color};
      width:28px;height:28px;
      border-radius:50%;
      border:2px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;
      color:white;font-weight:700;font-size:13px;
      font-family:system-ui,sans-serif;
    ">S</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

export default function ShelterLayer({ shelters, onShelterClick }: ShelterLayerProps) {
  if (!shelters || shelters.length === 0) return null;

  return (
    <>
      {shelters.map((shelter) => {
        const icon = createShelterIcon(shelter);
        const pct = Math.round((shelter.occupancy / shelter.totalCapacity) * 100);
        const statusLabel = getShelterStatusLabel(shelter);
        const statusColor = getShelterColor(shelter);

        return (
          <Marker
            key={shelter.id}
            position={[shelter.location.lat, shelter.location.lng]}
            icon={icon}
            eventHandlers={{ click: () => onShelterClick?.(shelter) }}
          >
            <Popup>
              <div style={{ minWidth: 200 }}>
                <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>
                  {shelter.name}
                </p>

                <span style={{
                  display: 'inline-block',
                  borderRadius: 4,
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'white',
                  backgroundColor: statusColor,
                  marginBottom: 8,
                }}>
                  {statusLabel}
                </span>

                <p style={{ fontSize: '0.875rem', color: '#334155', marginBottom: 4 }}>
                  Capacity:{' '}
                  <strong>{shelter.occupancy}/{shelter.totalCapacity}</strong>{' '}
                  <span style={{ color: '#64748b' }}>({pct}% full)</span>
                </p>

                {/* Capacity bar */}
                <div style={{ height: 6, background: '#e2e8f0', borderRadius: 99, marginBottom: 8, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(pct, 100)}%`,
                    backgroundColor: statusColor,
                    borderRadius: 99,
                    transition: 'width 0.3s',
                  }} />
                </div>

                <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: '#475569' }}>
                  {shelter.hasMedicalFacility && (
                    <span>🏥 Medical</span>
                  )}
                  {shelter.hasFood && (
                    <span>🍱 Food</span>
                  )}
                  {shelter.hasWater && (
                    <span>💧 Water</span>
                  )}
                </div>

                {shelter.address && (
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 6 }}>
                    {shelter.address}
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
