'use client';

import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import type { LatLng } from 'leaflet';

interface UserLocationMarkerProps {
  location: LatLng;
}

/** Pulsing blue dot for the user's current GPS position. */
function createUserIcon(): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="position:relative;width:20px;height:20px;">
        <!-- Outer pulse ring -->
        <div style="
          position:absolute;
          inset:-6px;
          border-radius:50%;
          background:rgba(59,130,246,0.3);
          animation:user-pulse 1.8s ease-out infinite;
        "></div>
        <!-- Inner dot -->
        <div style="
          position:absolute;
          inset:0;
          border-radius:50%;
          background:#2563eb;
          border:2.5px solid white;
          box-shadow:0 1px 6px rgba(37,99,235,0.6);
        "></div>
        <style>
          @keyframes user-pulse {
            0%   { transform:scale(1);   opacity:0.8; }
            100% { transform:scale(2.6); opacity:0;   }
          }
        </style>
      </div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -14],
  });
}

export default function UserLocationMarker({ location }: UserLocationMarkerProps) {
  return (
    <Marker
      position={location}
      icon={createUserIcon()}
      zIndexOffset={1000}
    >
      <Popup>
        <div>
          <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>
            Your Location
          </p>
          <p style={{ fontSize: '0.75rem', color: '#475569' }}>
            {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}
