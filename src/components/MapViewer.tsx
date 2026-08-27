import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, Circle, useMapEvents } from "react-leaflet";
import * as turf from "@turf/turf";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { ControlHub } from "./ControlHub";
import { IncidentModal } from "./IncidentModal";
import { EscalationPayload } from "./EscalationPayload";

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const shelterIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const hazardIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Shelter {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  totalCapacity: number;
  currentOccupancy: number;
  status: "ACTIVE" | "FULL" | "UNAVAILABLE";
}

interface HazardZone {
  id: string;
  type: "FLOOD" | "LANDSLIDE" | "FIRE";
  severity: "HIGH" | "MEDIUM";
  geometry: {
    type: "Polygon";
    coordinates: [number, number][][];
  };
}

interface IncidentObstacle {
  id: string;
  type: string;
  lat: number;
  lng: number;
  severity: "LOW" | "MEDIUM" | "HIGH";
  radiusKm: number;
  status: "ACTIVE" | "RESOLVED";
  verificationStatus: "VERIFIED" | "PENDING";
}

export default function MapViewer() {
  const [userLocation, setUserLocation] = useState<[number, number]>([16.5085, 80.6475]);
  const [locationStatus, setLocationStatus] = useState<string>("Initializing GPS...");

  const [shelters] = useState<Shelter[]>([
    { id: "shelter-01", name: "City Relief Camp A (Ayodhya Nagar)", lat: 16.5200, lng: 80.6200, address: "Sector 4", totalCapacity: 600, currentOccupancy: 310, status: "ACTIVE" },
    { id: "shelter-02", name: "District Hub B (Patamata)", lat: 16.4950, lng: 80.6700, address: "High School Grounds", totalCapacity: 1200, currentOccupancy: 1200, status: "FULL" },
    { id: "shelter-03", name: "Bhavani Island Safe Point", lat: 16.5160, lng: 80.5900, address: "North River Bank", totalCapacity: 400, currentOccupancy: 120, status: "ACTIVE" }
  ]);

  const [hazards] = useState<HazardZone[]>([
    {
      id: "hazard-01",
      type: "FLOOD",
      severity: "HIGH",
      geometry: {
        type: "Polygon",
        coordinates: [[[80.6300, 16.5150], [80.6420, 16.5150], [80.6420, 16.5070], [80.6300, 16.5070], [80.6300, 16.5150]]]
      }
    }
  ]);

  const [obstacles, setObstacles] = useState<IncidentObstacle[]>([
    { id: "obs-01", type: "FALLEN_TREE", lat: 16.5110, lng: 80.6380, severity: "HIGH", radiusKm: 0.35, status: "ACTIVE", verificationStatus: "VERIFIED" }
  ]);

  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [activeShelter, setActiveShelter] = useState<Shelter | null>(null);
  const [routeMetrics, setRouteMetrics] = useState<any | null>(null);
  const [reportingCoord, setReportingCoord] = useState<[number, number] | null>(null);
  const [escalationData, setEscalationData] = useState<any | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setLocationStatus("Live GPS Locked");
        },
        () => setLocationStatus("GPS Access Denied: Defaulting to Vijayawada Base Coordinates"),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setReportingCoord([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  }

  const handleIncidentSubmit = (type: string, severity: "LOW" | "MEDIUM" | "HIGH") => {
    if (!reportingCoord) return;
    const newObstacle: IncidentObstacle = {
      id: `incident-${Date.now()}`,
      type,
      lat: reportingCoord[0],
      lng: reportingCoord[1],
      severity,
      radiusKm: severity === "HIGH" ? 0.4 : 0.25,
      status: "ACTIVE",
      verificationStatus: "VERIFIED",
    };
    const updated = [...obstacles, newObstacle];
    setObstacles(updated);
    setReportingCoord(null);

    if (activeShelter) {
      evaluateAndRoute(activeShelter, updated);
    }
  };

  const evaluateAndRoute = (shelter: Shelter, currentObstacles: IncidentObstacle[] = obstacles) => {
    setActiveShelter(shelter);
    setEscalationData(null);

    const startPt = [userLocation[1], userLocation[0]];
    const endPt = [shelter.lng, shelter.lat];
    const directLine = turf.lineString([startPt, endPt]);

    const detectedThreats: string[] = [];
    const bypassOffsets: [number, number][] = [];

    hazards.forEach((h) => {
      const poly = turf.polygon(h.geometry.coordinates);
      if (turf.booleanIntersects(directLine, poly)) {
        detectedThreats.push(`${h.severity}${h.type} Zone`);
      }
    });import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, Circle, useMapEvents } from "react-leaflet";
import * as turf from "@turf/turf";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { ControlHub } from "./ControlHub";
import { IncidentModal } from "./IncidentModal";
import { EscalationPayload } from "./EscalationPayload";

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const shelterIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const hazardIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Shelter {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  totalCapacity: number;
  currentOccupancy: number;
  status: "ACTIVE" | "FULL" | "UNAVAILABLE";
}

interface HazardZone {
  id: string;
  type: "FLOOD" | "LANDSLIDE" | "FIRE";
  severity: "HIGH" | "MEDIUM";
  geometry: {
    type: "Polygon";
    coordinates: [number, number][][];
  };
}

interface IncidentObstacle {
  id: string;
  type: string;
  lat: number;
  lng: number;
  severity: "LOW" | "MEDIUM" | "HIGH";
  radiusKm: number;
  status: "ACTIVE" | "RESOLVED";
  verificationStatus: "VERIFIED" | "PENDING";
}

export default function MapViewer() {
  const [userLocation, setUserLocation] = useState<[number, number]>([16.5085, 80.6475]);
  const [locationStatus, setLocationStatus] = useState<string>("Initializing GPS...");

  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [hazards] = useState<HazardZone[]>([
    {
      id: "hazard-01",
      type: "FLOOD",
      severity: "HIGH",
      geometry: {
        type: "Polygon",
        coordinates: [[[80.6300, 16.5150], [80.6420, 16.5150], [80.6420, 16.5070], [80.6300, 16.5070], [80.6300, 16.5150]]]
      }
    }
  ]);

  const [obstacles, setObstacles] = useState<IncidentObstacle[]>([]);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [activeShelter, setActiveShelter] = useState<Shelter | null>(null);
  const [routeMetrics, setRouteMetrics] = useState<any | null>(null);
  const [reportingCoord, setReportingCoord] = useState<[number, number] | null>(null);
  const [escalationData, setEscalationData] = useState<any | null>(null);

  // 1. Initial Load from Backend API
  useEffect(() => {
    fetch("/api/shelters")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setShelters(data.data);
      })
      .catch((err) => console.error("Error fetching shelters:", err));

    fetch("/api/incidents")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setObstacles(data.incidents);
      })
      .catch((err) => console.error("Error fetching incidents:", err));
  }, []);

  // 2. Browser Geolocation Watcher
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setLocationStatus("Live GPS Locked");
        },
        () => setLocationStatus("GPS Access Denied: Defaulting to Vijayawada Base Coordinates"),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setReportingCoord([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  }

  // 3. Post Incident to Backend API
  const handleIncidentSubmit = async (type: string, severity: "LOW" | "MEDIUM" | "HIGH") => {
    if (!reportingCoord) return;

    const payload = {
      type,
      lat: reportingCoord[0],
      lng: reportingCoord[1],
      severity,
    };

    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.success) {
        const updated = [...obstacles, result.incident];
        setObstacles(updated);
        setReportingCoord(null);

        if (activeShelter) {
          evaluateAndRoute(activeShelter, updated);
        }
      }
    } catch (err) {
      console.error("Error submitting incident:", err);
    }
  };

  // 4. Routing & Real-Time Escalation
  const evaluateAndRoute = (shelter: Shelter, currentObstacles: IncidentObstacle[] = obstacles) => {
    setActiveShelter(shelter);
    setEscalationData(null);

    const startPt = [userLocation[1], userLocation[0]];
    const endPt = [shelter.lng, shelter.lat];
    const directLine = turf.lineString([startPt, endPt]);

    const detectedThreats: string[] = [];
    const bypassOffsets: [number, number][] = [];

    hazards.forEach((h) => {
      const poly = turf.polygon(h.geometry.coordinates);
      if (turf.booleanIntersects(directLine, poly)) {
        detectedThreats.push(`${h.severity} ${h.type} Zone`);
      }
    });

    currentObstacles
      .filter((o) => o.status === "ACTIVE" && o.verificationStatus === "VERIFIED")
      .forEach((obs) => {
        const obsPt = turf.point([obs.lng, obs.lat]);
        const buffer = turf.buffer(obsPt, obs.radiusKm, { units: "kilometers" });
        if (buffer && turf.booleanIntersects(directLine, buffer)) {
          detectedThreats.push(`${obs.type} obstacle`);
          const dLat = shelter.lat - userLocation[0];
          const dLng = shelter.lng - userLocation[1];
          const norm = Math.sqrt(dLat * dLat + dLng * dLng) || 1;
          bypassOffsets.push([obs.lat + (-dLng / norm) * 0.009, obs.lng + (dLat / norm) * 0.009]);
        }
      });

    // Scenario A: Clear Path
    if (detectedThreats.length === 0) {
      const path: [number, number][] = [userLocation, [shelter.lat, shelter.lng]];
      const dist = parseFloat(turf.length(directLine, { units: "kilometers" }).toFixed(2));
      setRouteCoords(path);
      setRouteMetrics({ distanceKm: dist, etaMins: Math.ceil((dist / 30) * 60) + 3, safetyScore: 1.0, warnings: [] });
      return;
    }

    // Scenario B: Minor Obstacles Bypassable
    if (bypassOffsets.length > 0 && bypassOffsets.length < 3) {
      const path: [number, number][] = [userLocation, ...bypassOffsets, [shelter.lat, shelter.lng]];
      const dist = parseFloat(turf.length(turf.lineString(path.map((p) => [p[1], p[0]])), { units: "kilometers" }).toFixed(2));
      setRouteCoords(path);
      setRouteMetrics({ distanceKm: dist, etaMins: Math.ceil((dist / 25) * 60) + 5, safetyScore: 0.88, warnings: detectedThreats });
      return;
    }

    // Scenario C: Total Entrapment -> Send Alert to Backend API
    const escalationPayload = {
      status: "NO_SAFE_ROUTE",
      priority: "HIGH",
      timestamp: new Date().toISOString(),
      userLocation: { latitude: userLocation[0], longitude: userLocation[1] },
      requestedShelter: shelter.name,
      blockingThreats: detectedThreats,
      recommendedAction: "REQUEST_RESCUE_OR_AUTHORITY_ASSISTANCE",
    };

    setRouteCoords([]);
    setRouteMetrics(null);
    setEscalationData(escalationPayload);

    fetch("/api/escalate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(escalationPayload),
    }).catch((err) => console.error("Error triggering escalation API:", err));
  };

  const autoSelectSafestShelter = () => {
    const valid = shelters.filter((s) => s.status === "ACTIVE" && s.currentOccupancy < s.totalCapacity);
    if (valid.length === 0) return;
    const sorted = [...valid].sort(
      (a, b) => Math.hypot(a.lat - userLocation[0], a.lng - userLocation[1]) - Math.hypot(b.lat - userLocation[0], b.lng - userLocation[1])
    );
    evaluateAndRoute(sorted[0]);
  };

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%", fontFamily: "sans-serif" }}>
      <div
        style={{
          position: "absolute",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          background: escalationData ? "#dc2626" : "#0f172a",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: "8px",
          fontWeight: "600",
          fontSize: "13px",
        }}
      >
        {escalationData ? "CRITICAL: No safe corridor found! Authority Rescue Escalation Triggered." : `RakshaNet Emergency Navigation • ${locationStatus}`}
      </div>

      <ControlHub
        hazardCount={obstacles.length}
        routeMetrics={routeMetrics}
        activeShelter={activeShelter}
        onAutoSelect={autoSelectSafestShelter}
      />

      {reportingCoord && (
        <IncidentModal
          coord={reportingCoord}
          onClose={() => setReportingCoord(null)}
          onSubmit={handleIncidentSubmit}
        />
      )}

      <EscalationPayload data={escalationData} />

      <MapContainer center={userLocation} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler />

        <Marker position={userLocation} icon={userIcon}>
          <Popup>Citizen Location</Popup>
        </Marker>

        {shelters.map((s) => (
          <Marker key={s.id} position={[s.lat, s.lng]} icon={shelterIcon}>
            <Popup>
              <strong>{s.name}</strong>
              <br />
              Occupancy: {s.currentOccupancy} / {s.totalCapacity}
              <br />
              <button
                onClick={() => evaluateAndRoute(s)}
                style={{ marginTop: 6, background: "#059669", color: "#fff", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}
              >
                Evacuate Here
              </button>
            </Popup>
          </Marker>
        ))}

        {hazards.map((h) => (
          <Polygon
            key={h.id}
            positions={h.geometry.coordinates[0].map((c) => [c[1], c[0]])}
            pathOptions={{ color: "#dc2626", fillColor: "#ef4444", fillOpacity: 0.3 }}
          />
        ))}

        {obstacles.map((obs) => (
          <React.Fragment key={obs.id}>
            <Marker position={[obs.lat, obs.lng]} icon={hazardIcon}>
              <Popup>⚠️ {obs.type}</Popup>
            </Marker>
            <Circle center={[obs.lat, obs.lng]} radius={obs.radiusKm * 1000} pathOptions={{ color: "#b91c1c", fillOpacity: 0.25 }} />
          </React.Fragment>
        ))}

        {routeCoords.length > 0 && <Polyline positions={routeCoords} color="#2563eb" weight={6} opacity={0.9} />}
      </MapContainer>
    </div>
  );
}

    currentObstacles.filter(o => o.status === "ACTIVE" && o.verificationStatus === "VERIFIED").forEach((obs) => {
      const obsPt = turf.point([obs.lng, obs.lat]);
      const buffer = turf.buffer(obsPt, obs.radiusKm, { units: "kilometers" });
      if (buffer && turf.booleanIntersects(directLine, buffer)) {
        detectedThreats.push(`${obs.type} obstacle`);
        const dLat = shelter.lat - userLocation[0];
        const dLng = shelter.lng - userLocation[1];
        const norm = Math.sqrt(dLat * dLat + dLng * dLng) || 1;
        bypassOffsets.push([obs.lat + (-dLng / norm) * 0.009, obs.lng + (dLat / norm) * 0.009]);
      }
    });

    if (detectedThreats.length === 0) {
      const path: [number, number][] = [userLocation, [shelter.lat, shelter.lng]];
      const dist = parseFloat(turf.length(directLine, { units: "kilometers" }).toFixed(2));
      setRouteCoords(path);
      setRouteMetrics({ distanceKm: dist, etaMins: Math.ceil((dist / 30) * 60) + 3, safetyScore: 1.0, warnings: [] });
      return;
    }

    if (bypassOffsets.length > 0 && bypassOffsets.length < 3) {
      const path: [number, number][] = [userLocation, ...bypassOffsets, [shelter.lat, shelter.lng]];
      const dist = parseFloat(turf.length(turf.lineString(path.map(p => [p[1], p[0]])), { units: "kilometers" }).toFixed(2));
      setRouteCoords(path);
      setRouteMetrics({ distanceKm: dist, etaMins: Math.ceil((dist / 25) * 60) + 5, safetyScore: 0.88, warnings: detectedThreats });
      return;
    }

    setRouteCoords([]);
    setRouteMetrics(null);
    setEscalationData({
      status: "NO_SAFE_ROUTE",
      priority: "HIGH",
      timestamp: new Date().toISOString(),
      userLocation: { latitude: userLocation[0], longitude: userLocation[1] },
      requestedShelter: shelter.name,
      blockingThreats: detectedThreats,
      recommendedAction: "REQUEST_RESCUE_OR_AUTHORITY_ASSISTANCE",
    });
  };

  const autoSelectSafestShelter = () => {
    const valid = shelters.filter(s => s.status === "ACTIVE" && s.currentOccupancy < s.totalCapacity);
    if (valid.length === 0) return;
    const sorted = [...valid].sort((a, b) => Math.hypot(a.lat - userLocation[0], a.lng - userLocation[1]) - Math.hypot(b.lat - userLocation[0], b.lng - userLocation[1]));
    evaluateAndRoute(sorted[0]);
  };

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%", fontFamily: "sans-serif" }}>
      <div style={{
        position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
        zIndex: 1000, background: escalationData ? "#dc2626" : "#0f172a", color: "#fff",
        padding: "10px 20px", borderRadius: "8px", fontWeight: "600", fontSize: "13px"
      }}>
        {escalationData ? "CRITICAL: No safe corridor found! Rescue Escalation Triggered." : `RakshaNet Emergency Navigation • ${locationStatus}`}
      </div>

      <ControlHub 
        hazardCount={obstacles.length}
        routeMetrics={routeMetrics}
        activeShelter={activeShelter}
        onAutoSelect={autoSelectSafestShelter}
      />

      {reportingCoord && (
        <IncidentModal 
          coord={reportingCoord} 
          onClose={() => setReportingCoord(null)} 
          onSubmit={handleIncidentSubmit} 
        />
      )}

      <EscalationPayload data={escalationData} />

      <MapContainer center={userLocation} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler />

        <Marker position={userLocation} icon={userIcon}><Popup>Citizen Location</Popup></Marker>

        {shelters.map((s) => (
          <Marker key={s.id} position={[s.lat, s.lng]} icon={shelterIcon}>
            <Popup>
              <strong>{s.name}</strong><br />
              Occupancy: {s.currentOccupancy} / {s.totalCapacity}<br />
              <button onClick={() => evaluateAndRoute(s)} style={{ marginTop: 6, background: "#059669", color: "#fff", border: "none", padding: "4px 8px", borderRadius: 4 }}>
                Evacuate Here
              </button>
            </Popup>
          </Marker>
        ))}

        {hazards.map((h) => (
          <Polygon key={h.id} positions={h.geometry.coordinates[0].map(c => [c[1], c[0]])} pathOptions={{ color: "#dc2626", fillColor: "#ef4444", fillOpacity: 0.3 }} />
        ))}

        {obstacles.map((obs) => (
          <React.Fragment key={obs.id}>
            <Marker position={[obs.lat, obs.lng]} icon={hazardIcon}><Popup>⚠️ {obs.type}</Popup></Marker>
            <Circle center={[obs.lat, obs.lng]} radius={obs.radiusKm * 1000} pathOptions={{ color: "#b91c1c", fillOpacity: 0.25 }} />
          </React.Fragment>
        ))}

        {routeCoords.length > 0 && <Polyline positions={routeCoords} color="#2563eb" weight={6} opacity={0.9} />}
      </MapContainer>
    </div>
  );
}import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, Circle, useMapEvents } from "react-leaflet";
import * as turf from "@turf/turf";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { ControlHub } from "./ControlHub";
import { IncidentModal } from "./IncidentModal";
import { EscalationPayload } from "./EscalationPayload";

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const shelterIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const hazardIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Shelter {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  totalCapacity: number;
  currentOccupancy: number;
  status: "ACTIVE" | "FULL" | "UNAVAILABLE";
}

interface HazardZone {
  id: string;
  type: "FLOOD" | "LANDSLIDE" | "FIRE";
  severity: "HIGH" | "MEDIUM";
  geometry: {
    type: "Polygon";
    coordinates: [number, number][][];
  };
}

interface IncidentObstacle {
  id: string;
  type: string;
  lat: number;
  lng: number;
  severity: "LOW" | "MEDIUM" | "HIGH";
  radiusKm: number;
  status: "ACTIVE" | "RESOLVED";
  verificationStatus: "VERIFIED" | "PENDING";
}

export default function MapViewer() {
  const [userLocation, setUserLocation] = useState<[number, number]>([16.5085, 80.6475]);
  const [locationStatus, setLocationStatus] = useState<string>("Initializing GPS...");

  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [hazards] = useState<HazardZone[]>([
    {
      id: "hazard-01",
      type: "FLOOD",
      severity: "HIGH",
      geometry: {
        type: "Polygon",
        coordinates: [[[80.6300, 16.5150], [80.6420, 16.5150], [80.6420, 16.5070], [80.6300, 16.5070], [80.6300, 16.5150]]]
      }
    }
  ]);

  const [obstacles, setObstacles] = useState<IncidentObstacle[]>([]);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [activeShelter, setActiveShelter] = useState<Shelter | null>(null);
  const [routeMetrics, setRouteMetrics] = useState<any | null>(null);
  const [reportingCoord, setReportingCoord] = useState<[number, number] | null>(null);
  const [escalationData, setEscalationData] = useState<any | null>(null);

  // 1. Initial Load from Backend API
  useEffect(() => {
    fetch("/api/shelters")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setShelters(data.data);
      })
      .catch((err) => console.error("Error fetching shelters:", err));

    fetch("/api/incidents")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setObstacles(data.incidents);
      })
      .catch((err) => console.error("Error fetching incidents:", err));
  }, []);

  // 2. Browser Geolocation Watcher
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setLocationStatus("Live GPS Locked");
        },
        () => setLocationStatus("GPS Access Denied: Defaulting to Vijayawada Base Coordinates"),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setReportingCoord([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  }

  // 3. Post Incident to Backend API
  const handleIncidentSubmit = async (type: string, severity: "LOW" | "MEDIUM" | "HIGH") => {
    if (!reportingCoord) return;

    const payload = {
      type,
      lat: reportingCoord[0],
      lng: reportingCoord[1],
      severity,
    };

    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.success) {
        const updated = [...obstacles, result.incident];
        setObstacles(updated);
        setReportingCoord(null);

        if (activeShelter) {
          evaluateAndRoute(activeShelter, updated);
        }
      }
    } catch (err) {
      console.error("Error submitting incident:", err);
    }
  };

  // 4. Routing & Real-Time Escalation
  const evaluateAndRoute = (shelter: Shelter, currentObstacles: IncidentObstacle[] = obstacles) => {
    setActiveShelter(shelter);
    setEscalationData(null);

    const startPt = [userLocation[1], userLocation[0]];
    const endPt = [shelter.lng, shelter.lat];
    const directLine = turf.lineString([startPt, endPt]);

    const detectedThreats: string[] = [];
    const bypassOffsets: [number, number][] = [];

    hazards.forEach((h) => {
      const poly = turf.polygon(h.geometry.coordinates);
      if (turf.booleanIntersects(directLine, poly)) {
        detectedThreats.push(`${h.severity} ${h.type} Zone`);
      }
    });

    currentObstacles
      .filter((o) => o.status === "ACTIVE" && o.verificationStatus === "VERIFIED")
      .forEach((obs) => {
        const obsPt = turf.point([obs.lng, obs.lat]);
        const buffer = turf.buffer(obsPt, obs.radiusKm, { units: "kilometers" });
        if (buffer && turf.booleanIntersects(directLine, buffer)) {
          detectedThreats.push(`${obs.type} obstacle`);
          const dLat = shelter.lat - userLocation[0];
          const dLng = shelter.lng - userLocation[1];
          const norm = Math.sqrt(dLat * dLat + dLng * dLng) || 1;
          bypassOffsets.push([obs.lat + (-dLng / norm) * 0.009, obs.lng + (dLat / norm) * 0.009]);
        }
      });

    // Scenario A: Clear Path
    if (detectedThreats.length === 0) {
      const path: [number, number][] = [userLocation, [shelter.lat, shelter.lng]];
      const dist = parseFloat(turf.length(directLine, { units: "kilometers" }).toFixed(2));
      setRouteCoords(path);
      setRouteMetrics({ distanceKm: dist, etaMins: Math.ceil((dist / 30) * 60) + 3, safetyScore: 1.0, warnings: [] });
      return;
    }

    // Scenario B: Minor Obstacles Bypassable
    if (bypassOffsets.length > 0 && bypassOffsets.length < 3) {
      const path: [number, number][] = [userLocation, ...bypassOffsets, [shelter.lat, shelter.lng]];
      const dist = parseFloat(turf.length(turf.lineString(path.map((p) => [p[1], p[0]])), { units: "kilometers" }).toFixed(2));
      setRouteCoords(path);
      setRouteMetrics({ distanceKm: dist, etaMins: Math.ceil((dist / 25) * 60) + 5, safetyScore: 0.88, warnings: detectedThreats });
      return;
    }

    // Scenario C: Total Entrapment -> Send Alert to Backend API
    const escalationPayload = {
      status: "NO_SAFE_ROUTE",
      priority: "HIGH",
      timestamp: new Date().toISOString(),
      userLocation: { latitude: userLocation[0], longitude: userLocation[1] },
      requestedShelter: shelter.name,
      blockingThreats: detectedThreats,
      recommendedAction: "REQUEST_RESCUE_OR_AUTHORITY_ASSISTANCE",
    };

    setRouteCoords([]);
    setRouteMetrics(null);
    setEscalationData(escalationPayload);

    fetch("/api/escalate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(escalationPayload),
    }).catch((err) => console.error("Error triggering escalation API:", err));
  };

  const autoSelectSafestShelter = () => {
    const valid = shelters.filter((s) => s.status === "ACTIVE" && s.currentOccupancy < s.totalCapacity);
    if (valid.length === 0) return;
    const sorted = [...valid].sort(
      (a, b) => Math.hypot(a.lat - userLocation[0], a.lng - userLocation[1]) - Math.hypot(b.lat - userLocation[0], b.lng - userLocation[1])
    );
    evaluateAndRoute(sorted[0]);
  };

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%", fontFamily: "sans-serif" }}>
      <div
        style={{
          position: "absolute",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          background: escalationData ? "#dc2626" : "#0f172a",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: "8px",
          fontWeight: "600",
          fontSize: "13px",
        }}
      >
        {escalationData ? "CRITICAL: No safe corridor found! Authority Rescue Escalation Triggered." : `RakshaNet Emergency Navigation • ${locationStatus}`}
      </div>

      <ControlHub
        hazardCount={obstacles.length}
        routeMetrics={routeMetrics}
        activeShelter={activeShelter}
        onAutoSelect={autoSelectSafestShelter}
      />

      {reportingCoord && (
        <IncidentModal
          coord={reportingCoord}
          onClose={() => setReportingCoord(null)}
          onSubmit={handleIncidentSubmit}
        />
      )}

      <EscalationPayload data={escalationData} />

      <MapContainer center={userLocation} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler />

        <Marker position={userLocation} icon={userIcon}>
          <Popup>Citizen Location</Popup>
        </Marker>

        {shelters.map((s) => (
          <Marker key={s.id} position={[s.lat, s.lng]} icon={shelterIcon}>
            <Popup>
              <strong>{s.name}</strong>
              <br />
              Occupancy: {s.currentOccupancy} / {s.totalCapacity}
              <br />
              <button
                onClick={() => evaluateAndRoute(s)}
                style={{ marginTop: 6, background: "#059669", color: "#fff", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}
              >
                Evacuate Here
              </button>
            </Popup>
          </Marker>
        ))}

        {hazards.map((h) => (
          <Polygon
            key={h.id}
            positions={h.geometry.coordinates[0].map((c) => [c[1], c[0]])}
            pathOptions={{ color: "#dc2626", fillColor: "#ef4444", fillOpacity: 0.3 }}
          />
        ))}

        {obstacles.map((obs) => (
          <React.Fragment key={obs.id}>
            <Marker position={[obs.lat, obs.lng]} icon={hazardIcon}>
              <Popup>⚠️ {obs.type}</Popup>
            </Marker>
            <Circle center={[obs.lat, obs.lng]} radius={obs.radiusKm * 1000} pathOptions={{ color: "#b91c1c", fillOpacity: 0.25 }} />
          </React.Fragment>
        ))}

        {routeCoords.length > 0 && <Polyline positions={routeCoords} color="#2563eb" weight={6} opacity={0.9} />}
      </MapContainer>
    </div>
  );
}