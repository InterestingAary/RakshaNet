'use client';

import L from 'leaflet';
import { Polyline, CircleMarker, Marker, Popup } from 'react-leaflet';
import type { EvacuationRoute } from '@/types';

interface RouteLayerProps {
  route: EvacuationRoute;
}

type RouteStatus = 'safe' | 'caution' | 'blocked' | 'recalculating';

const ROUTE_STYLE: Record<
  RouteStatus,
  { color: string; weight: number; dashArray: string | undefined }
> = {
  safe:          { color: '#16a34a', weight: 4, dashArray: undefined },
  caution:       { color: '#ea580c', weight: 4, dashArray: '8,4' },
  blocked:       { color: '#dc2626', weight: 4, dashArray: '4,4' },
  recalculating: { color: '#2563eb', weight: 3, dashArray: '2,4' },
};

function createStartIcon(): L.DivIcon {
  return L.divIcon({
    html: `<div style="
      background-color:#2563eb;
      width:20px;height:20px;
      border-radius:50%;
      border:2px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,0.4);
    "></div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function createEndIcon(): L.DivIcon {
  return L.divIcon({
    html: `<div style="
      background-color:#16a34a;
      width:20px;height:20px;
      border-radius:50%;
      border:2px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;
      color:white;font-weight:700;font-size:11px;
    ">S</div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export default function RouteLayer({ route }: RouteLayerProps) {
  if (!route.waypoints || route.waypoints.length < 2) return null;

  const status = (route.status ?? 'safe') as RouteStatus;
  const style = ROUTE_STYLE[status] ?? ROUTE_STYLE.safe;

  const positions: [number, number][] = route.waypoints.map((wp) => [
    wp.lat,
    wp.lng,
  ]);

  const startPos = positions[0];
  const endPos = positions[positions.length - 1];

  return (
    <>
      <Polyline
        positions={positions}
        pathOptions={{
          color:     style.color,
          weight:    style.weight,
          dashArray: style.dashArray,
          lineCap:   'round',
          lineJoin:  'round',
        }}
      >
        <Popup>
          <div style={{ minWidth: 160 }}>
            <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
              {route.toShelterName ?? 'Evacuation Route'}
            </p>
            <p style={{ fontSize: '0.813rem', color: '#475569', textTransform: 'capitalize' }}>
              Status: {status}
            </p>
            {route.estimatedTimeMin != null && (
              <p style={{ fontSize: '0.813rem', color: '#475569' }}>
                ETA: {route.estimatedTimeMin} min
              </p>
            )}
            {route.distanceKm != null && (
              <p style={{ fontSize: '0.813rem', color: '#475569' }}>
                Distance: {route.distanceKm} km
              </p>
            )}
          </div>
        </Popup>
      </Polyline>

      {/* Start marker */}
      <Marker position={startPos} icon={createStartIcon()} />

      {/* End marker (shelter) */}
      <Marker position={endPos} icon={createEndIcon()} />

      {/* Route warnings */}
      {route.warnings?.map((warning, idx) => (
        <CircleMarker
          key={`warning-${idx}`}
          center={[warning.location.lat, warning.location.lng]}
          radius={7}
          pathOptions={{
            color:       warning.severity === 'high' ? '#b91c1c' : '#a16207',
            fillColor:   warning.severity === 'high' ? '#ef4444' : '#eab308',
            fillOpacity: 0.9,
            weight:      2,
          }}
        >
          <Popup>
            <div style={{ minWidth: 140 }}>
              <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
                ⚠ Route Warning
              </p>
              <p style={{ fontSize: '0.813rem', color: '#475569' }}>
                {warning.description}
              </p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}
