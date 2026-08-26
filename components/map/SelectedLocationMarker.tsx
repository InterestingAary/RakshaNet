'use client';

import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import type { LatLng } from 'leaflet';

interface SelectedLocationMarkerProps {
  location: LatLng;
}

/** Crosshair/pin for a manually selected map location. */
function createSelectedIcon(): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="position:relative;width:30px;height:30px;">
        <!-- Vertical line -->
        <div style="
          position:absolute;
          left:50%;top:0;
          transform:translateX(-50%);
          width:2px;height:30px;
          background:#0f172a;opacity:0.7;
        "></div>
        <!-- Horizontal line -->
        <div style="
          position:absolute;
          top:50%;left:0;
          transform:translateY(-50%);
          height:2px;width:30px;
          background:#0f172a;opacity:0.7;
        "></div>
        <!-- Centre dot -->
        <div style="
          position:absolute;
          top:50%;left:50%;
          transform:translate(-50%,-50%);
          width:8px;height:8px;
          border-radius:50%;
          background:#f43f5e;
          border:2px solid white;
          box-shadow:0 1px 4px rgba(0,0,0,0.4);
        "></div>
      </div>`,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -18],
  });
}

export default function SelectedLocationMarker({
  location,
}: SelectedLocationMarkerProps) {
  return (
    <Marker
      position={location}
      icon={createSelectedIcon()}
      zIndexOffset={900}
    >
      <Popup>
        <div>
          <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>
            Selected Location
          </p>
          <p style={{ fontSize: '0.75rem', color: '#475569' }}>
            {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}
