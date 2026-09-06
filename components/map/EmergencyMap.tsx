'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import type { LatLng } from 'leaflet';
import React, { useEffect } from 'react';

import HazardLayer from './HazardLayer';
import ShelterLayer from './ShelterLayer';
import IncidentLayer from './IncidentLayer';
import RouteLayer from './RouteLayer';
import BlockedRoadLayer from './BlockedRoadLayer';
import ResponseTeamLayer from './ResponseTeamLayer';
import UserLocationMarker from './UserLocationMarker';
import SelectedLocationMarker from './SelectedLocationMarker';

import type {
  HazardZone,
  Shelter,
  IncidentReport,
  EvacuationRoute,
  ResponseTeam,
  BlockedRoad,
} from '@/types';

// Fix Leaflet's broken default icon in webpack/Next.js environments
function fixLeafletIcons() {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl:
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl:
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

export interface MapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
  showHazards?: boolean;
  showShelters?: boolean;
  showIncidents?: boolean;
  showRoutes?: boolean;
  showBlockedRoads?: boolean;
  showResponseTeams?: boolean;
  hazardZones?: HazardZone[];
  shelters?: Shelter[];
  incidents?: IncidentReport[];
  routes?: EvacuationRoute[];
  responseTeams?: ResponseTeam[];
  blockedRoads?: BlockedRoad[];
  onShelterClick?: (shelter: Shelter) => void;
  onIncidentClick?: (incident: IncidentReport) => void;
  onMapClick?: (latlng: LatLng) => void;
  selectedLocation?: LatLng | null;
  userLocation?: LatLng | null;
  recommendedShelterId?: string;
  children?: React.ReactNode;
}

/** Wires map click events without exposing the internal map instance */
function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (latlng: LatLng) => void;
}) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

const DEFAULT_CENTER: [number, number] = [16.5062, 80.648];
const DEFAULT_ZOOM = 13;

export default function EmergencyMap({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  height = '100%',
  className = '',
  showHazards = true,
  showShelters = true,
  showIncidents = true,
  showRoutes = true,
  showBlockedRoads = true,
  showResponseTeams = false,
  hazardZones = [],
  shelters = [],
  incidents = [],
  routes = [],
  responseTeams = [],
  blockedRoads = [],
  onShelterClick,
  onIncidentClick,
  onMapClick,
  selectedLocation,
  userLocation,
  recommendedShelterId,
  children,
}: MapProps) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: '100%' }}
      className={className}
      scrollWheelZoom
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />

      {onMapClick && <MapClickHandler onMapClick={onMapClick} />}

      {showHazards && <HazardLayer zones={hazardZones} />}

      {showShelters && (
        <ShelterLayer
          shelters={shelters}
          onShelterClick={onShelterClick}
          recommendedShelterId={recommendedShelterId}
        />
      )}

      {showIncidents && (
        <IncidentLayer
          incidents={incidents}
          onIncidentClick={onIncidentClick}
        />
      )}

      {showRoutes &&
        routes.map((route) => <RouteLayer key={route.id} route={route} />)}

      {showBlockedRoads && (
        <BlockedRoadLayer
          blockedRoads={blockedRoads}
          incidents={incidents}
        />
      )}

      {showResponseTeams && <ResponseTeamLayer teams={responseTeams} />}

      {userLocation && <UserLocationMarker location={userLocation} />}

      {selectedLocation && (
        <SelectedLocationMarker location={selectedLocation} />
      )}

      {children}
    </MapContainer>
  );
}
