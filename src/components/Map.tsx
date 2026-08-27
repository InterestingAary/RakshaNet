import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, Circle, useMapEvents } from "react-leaflet";
import * as turf from "@turf/turf";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Marker Icons
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
  hasImageEvidence?: boolean;
}

export default function RakshaNetDashboard() {
  const [userLocation, setUserLocation] = useState<[number, number]>([16.5085, 80.6475]);
  const [locationStatus, setLocationStatus] = useState<string>("Initializing GPS...");
  
  const [shelters, setShelters] = useState<Shelter[]>([
    {
      id: "shelter-01",
      name: "City Relief Camp A (Ayodhya Nagar)",
      lat: 16.5200,
      lng: 80.6200,
      address: "Main Disaster Relief Center",
      totalCapacity: 600,
      currentOccupancy: 310,
      status: "ACTIVE",
    },
    {
      id: "shelter-02",
      name: "District Hub B (Patamata)",
      lat: 16.4950,
      lng: 80.6700,
      address: "Primary Public Health School",
      totalCapacity: 1200,
      currentOccupancy: 1200,
      status: "FULL",
    },
    {
      id: "shelter-03",
      name: "Bhavani Island Safe Point",
      lat: 16.5160,
      lng: 80.5900,
      address: "North River Bank Relief Post",
      totalCapacity: 400,
      currentOccupancy: 120,
      status: "ACTIVE",
    }
  ]);

  const [hazards] = useState<HazardZone[]>([
    {
      id: "hazard-01",
      type: "FLOOD",
      severity: "HIGH",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [80.6300, 16.5150],
          [80.6420, 16.5150],
          [80.6420, 16.5070],
          [80.6300, 16.5070],
          [80.6300, 16.5150]
        ]]
      }
    }
  ]);

  const [obstacles, setObstacles] = useState<IncidentObstacle[]>([
    {
      id: "obs-01",
      type: "FALLEN_TREE",
      lat: 16.5110,
      lng: 80.6380,
      severity: "HIGH",
      radiusKm: 0.35,
      status: "ACTIVE",
      verificationStatus: "VERIFIED",
      hasImageEvidence: true,
    }
  ]);

  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [activeShelter, setActiveShelter] = useState<Shelter | null>(null);
  const [routeMetrics, setRouteMetrics] = useState<{ distanceKm: number; etaMins: number; safetyScore: number; warnings: string[] } | null>(null);
  
  // Modals & Authority Escalation
  const [reportingCoord, setReportingCoord] = useState<[number, number] | null>(null);
  const [incidentType, setIncidentType] = useState("FALLEN_TREE");
  const [incidentSeverity, setIncidentSeverity] = useState<"LOW" | "MEDIUM" | "HIGH">("HIGH");
  const [escalationData, setEscalationData] = useState<any | null>(null);

  // 1. Live Geolocation with Fallback
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setLocationStatus("Live GPS Locked");
        },
        () => {
          setLocationStatus("GPS Access Denied: Defaulting to Vijayawada Base Coordinates");
        },
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setLocationStatus("Geolocation not supported by browser");
    }
  }, []);

  // 2. Map Click Handler for Incident Modal
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setReportingCoord([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  }

  // Submit citizen hazard report
  const submitIncident = () => {
    if (!reportingCoord) return;
    const newObstacle: IncidentObstacle = {
      id: `incident-${Date.now()}`,
      type: incidentType,
      lat: reportingCoord[0],
      lng: reportingCoord[1],
      severity: incidentSeverity,
      radiusKm: incidentSeverity === "HIGH" ? 0.4 : 0.25,
      status: "ACTIVE",
      verificationStatus: "VERIFIED",
      hasImageEvidence: true,
    };
    const updatedObstacles = [...obstacles, newObstacle];
    setObstacles(updatedObstacles);
    setReportingCoord(null);

    // Dynamic Rerouting if route is currently active
    if (activeShelter) {
      evaluateAndRoute(activeShelter, updatedObstacles);
    }
  };

  // 3. Hazard Evaluation and Routing Algorithm
  const evaluateAndRoute = (shelter: Shelter, currentObstacles: IncidentObstacle[] = obstacles) => {
    setActiveShelter(shelter);
    setEscalationData(null);

    const startPt = [userLocation[1], userLocation[0]]; // [lng, lat]
    const endPt = [shelter.lng, shelter.lat];
    const directLine = turf.lineString([startPt, endPt]);

    const detectedThreats: string[] = [];
    const bypassOffsets: [number, number][] = [];

    // Check Hazard Polygons
    hazards.forEach((h) => {
      const poly = turf.polygon(h.geometry.coordinates);
      if (turf.booleanIntersects(directLine, poly)) {
        detectedThreats.push(`${h.severity} ${h.type} Zone`);
      }
    });

    // Check Active Verified Obstacles
    currentObstacles.filter(o => o.status === "ACTIVE" && o.verificationStatus === "VERIFIED").forEach((obs) => {
      const obsPt = turf.point([obs.lng, obs.lat]);
      const buffer = turf.buffer(obsPt, obs.radiusKm, { units: "kilometers" });
      if (buffer && turf.booleanIntersects(directLine, buffer)) {
        detectedThreats.push(`${obs.type} obstacle`);

        // Compute deflection bypass
        const dLat = shelter.lat - userLocation[0];
        const dLng = shelter.lng - userLocation[1];
        const norm = Math.sqrt(dLat * dLat + dLng * dLng) || 1;
        bypassOffsets.push([obs.lat + (-dLng / norm) * 0.009, obs.lng + (dLat / norm) * 0.009]);
      }
    });

    // Scenario 1: Direct Clear Route
    if (detectedThreats.length === 0) {
      const path: [number, number][] = [userLocation, [shelter.lat, shelter.lng]];
      const dist = parseFloat((turf.length(directLine, { units: "kilometers" })).toFixed(2));
      setRouteCoords(path);
      setRouteMetrics({
        distanceKm: dist,
        etaMins: Math.ceil((dist / 30) * 60) + 3,
        safetyScore: 1.0,
        warnings: [],
      });
      return;
    }

    // Scenario 2: Hazard Detected, Path Rerouted
    if (bypassOffsets.length > 0 && bypassOffsets.length < 3) {
      const path: [number, number][] = [userLocation, ...bypassOffsets, [shelter.lat, shelter.lng]];
      const turfDetour = turf.lineString(path.map(p => [p[1], p[0]]));
      const dist = parseFloat((turf.length(turfDetour, { units: "kilometers" })).toFixed(2));
      setRouteCoords(path);
      setRouteMetrics({
        distanceKm: dist,
        etaMins: Math.ceil((dist / 25) * 60) + 5,
        safetyScore: 0.88,
        warnings: detectedThreats,
      });
      return;
    }

    // Scenario 3: No Safe Route Possible -> Trigger Authority Escalation
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

  // 4. Multi-Shelter Auto Selection
  const autoSelectSafestShelter = () => {
    const validShelters = shelters.filter(s => s.status === "ACTIVE" && s.currentOccupancy < s.totalCapacity);
    if (validShelters.length === 0) {
      alert("No shelters currently have remaining capacity.");
      return;
    }

    // Sort by proximity to citizen
    const sorted = [...validShelters].sort((a, b) => {
      const distA = Math.hypot(a.lat - userLocation[0], a.lng - userLocation[1]);
      const distB = Math.hypot(b.lat - userLocation[0], b.lng - userLocation[1]);
      return distA - distB;
    });

    evaluateAndRoute(sorted[0]);
  };

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* Top Banner */}
      <div style={{
        position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
        zIndex: 1000, background: escalationData ? "#dc2626" : "#0f172a", color: "#fff",
        padding: "10px 20px", borderRadius: "8px", fontWeight: "600", fontSize: "13px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)", textAlign: "center", maxWidth: "80%"
      }}>
        {escalationData
          ? "CRITICAL: No safe corridor found! Authority Rescue Escalation Triggered."
          : `RakshaNet Emergency Navigation • ${locationStatus}`}
      </div>

      {/* Control Hub Panel */}
      <div style={{
        position: "absolute", top: 64, left: 16, zIndex: 1000, width: "320px",
        background: "rgba(15, 23, 42, 0.95)", color: "#fff", padding: "16px",
        borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", backdropFilter: "blur(6px)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <strong style={{ color: "#38bdf8", fontSize: "15px" }}>RakshaNet Control Hub</strong>
          <span style={{ fontSize: "11px", background: "#1e293b", padding: "3px 8px", borderRadius: "4px" }}>
            {obstacles.length} Hazards
          </span>
        </div>

        <button
          onClick={autoSelectSafestShelter}
          style={{
            width: "100%", padding: "10px", background: "#0284c7", color: "#fff",
            border: "none", borderRadius: "6px", fontWeight: "bold", fontSize: "13px",
            cursor: "pointer", marginBottom: "8px"
          }}
        >
          Auto-Select Safest Shelter
        </button>

        {/* Route Metrics Card */}
        {routeMetrics && activeShelter && (
          <div style={{ background: "#1e293b", padding: "12px", borderRadius: "6px", fontSize: "12px", marginBottom: "8px" }}>
            <div style={{ fontWeight: "bold", color: "#4ade80", marginBottom: "4px" }}>Target: {activeShelter.name}</div>
            <div>Distance: <strong>{routeMetrics.distanceKm} km</strong></div>
            <div>Estimated Evacuation Time: <strong>{routeMetrics.etaMins} mins</strong></div>
            <div>Safety Score: <strong>{(routeMetrics.safetyScore * 100).toFixed(0)}% Clear</strong></div>
            {routeMetrics.warnings.length > 0 && (
              <div style={{ color: "#f87171", marginTop: "6px", fontSize: "11px" }}>
                ⚠️ Rerouted past: {routeMetrics.warnings.join(", ")}
              </div>
            )}
          </div>
        )}

        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
          Tip: Click anywhere on the map to submit a citizen obstacle report with photo evidence.
        </div>
      </div>

      {/* Citizen Report Modal */}
      {reportingCoord && (
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          zIndex: 2000, background: "#0f172a", color: "#fff", padding: "20px",
          borderRadius: "10px", width: "320px", boxShadow: "0 10px 30px rgba(0,0,0,0.6)"
        }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#f87171" }}>Report Road Obstacle</h4>
          <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 12px 0" }}>
            GPS: {reportingCoord[0].toFixed(4)}, {reportingCoord[1].toFixed(4)}
          </p>

          <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Obstacle Type:</label>
          <select 
            value={incidentType} 
            onChange={(e) => setIncidentType(e.target.value)}
            style={{ width: "100%", padding: "8px", borderRadius: "4px", marginBottom: "10px", background: "#1e293b", color: "#fff", border: "1px solid #334155" }}
          >
            <option value="FALLEN_TREE">Fallen Tree</option>
            <option value="FLOODED_ROAD">Flooded Road</option>
            <option value="LANDSLIDE">Landslide</option>
            <option value="COLLAPSED_BRIDGE">Collapsed Bridge</option>
          </select>

          <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Severity Level:</label>
          <select 
            value={incidentSeverity} 
            onChange={(e) => setIncidentSeverity(e.target.value as any)}
            style={{ width: "100%", padding: "8px", borderRadius: "4px", marginBottom: "12px", background: "#1e293b", color: "#fff", border: "1px solid #334155" }}
          >
            <option value="HIGH">High (Completely Blocked)</option>
            <option value="MEDIUM">Medium (Partial Restriction)</option>
            <option value="LOW">Low (Passable with Caution)</option>
          </select>

          <div style={{ fontSize: "11px", color: "#38bdf8", marginBottom: "14px", background: "#1e293b", padding: "8px", borderRadius: "4px" }}>
            ✓ Geotagged Photo Evidence Attached (Simulated)
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button 
              onClick={submitIncident}
              style={{ flex: 1, padding: "8px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
            >
              Submit Report
            </button>
            <button 
              onClick={() => setReportingCoord(null)}
              style={{ flex: 1, padding: "8px", background: "#334155", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Authority Rescue Escalation JSON Preview */}
      {escalationData && (
        <div style={{
          position: "absolute", bottom: 20, right: 20, zIndex: 1000, width: "360px",
          background: "rgba(24, 0, 0, 0.95)", border: "1px solid #dc2626", color: "#fff",
          padding: "16px", borderRadius: "8px", fontSize: "11px", boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
        }}>
          <strong style={{ color: "#f87171", display: "block", marginBottom: "6px" }}>
            🚨 Authority Rescue Dispatch Payload
          </strong>
          <pre style={{ margin: 0, overflowX: "auto", background: "#000", padding: "8px", borderRadius: "4px", color: "#4ade80" }}>
            {JSON.stringify(escalationData, null, 2)}
          </pre>
        </div>
      )}

      {/* Leaflet Map */}
      <MapContainer center={userLocation} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler />

        {/* User Location */}
        <Marker position={userLocation} icon={userIcon}>
          <Popup><strong>Citizen Location (You)</strong><br />Lat: {userLocation[0].toFixed(4)}, Lng: {userLocation[1].toFixed(4)}</Popup>
        </Marker>

        {/* Shelters */}
        {shelters.map((s) => (
          <Marker key={s.id} position={[s.lat, s.lng]} icon={shelterIcon}>
            <Popup>
              <strong>{s.name}</strong><br />
              Status: <span style={{ color: s.status === "ACTIVE" ? "green" : "red", fontWeight: "bold" }}>{s.status}</span><br />
              Occupancy: {s.currentOccupancy} / {s.totalCapacity}<br />
              <button
                disabled={s.status !== "ACTIVE" || s.currentOccupancy >= s.totalCapacity}
                onClick={() => evaluateAndRoute(s)}
                style={{
                  marginTop: 8, background: s.status === "ACTIVE" ? "#059669" : "#64748b",
                  color: "#fff", border: "none", padding: "6px 10px", borderRadius: 4,
                  cursor: s.status === "ACTIVE" ? "pointer" : "not-allowed", width: "100%", fontWeight: "bold"
                }}
              >
                {s.status === "ACTIVE" ? "Evacuate Here" : "Shelter Full"}
              </button>
            </Popup>
          </Marker>
        ))}

        {/* Hazard Polygons */}
        {hazards.map((h) => (
          <Polygon
            key={h.id}
            positions={h.geometry.coordinates[0].map(c => [c[1], c[0]])}
            pathOptions={{ color: "#dc2626", fillColor: "#ef4444", fillOpacity: 0.3 }}
          />
        ))}

        {/* Obstacles and Danger Buffer Zones */}
        {obstacles.map((obs) => (
          <React.Fragment key={obs.id}>
            <Marker position={[obs.lat, obs.lng]} icon={hazardIcon}>
              <Popup>⚠️ Obstacle: {obs.type} ({obs.severity})</Popup>
            </Marker>
            <Circle
              center={[obs.lat, obs.lng]}
              radius={obs.radiusKm * 1000}
              pathOptions={{ color: "#b91c1c", fillColor: "#dc2626", fillOpacity: 0.25 }}
            />
          </React.Fragment>
        ))}

        {/* Safe Evacuation Polyline */}
        {routeCoords.length > 0 && (
          <Polyline
            positions={routeCoords}
            color="#2563eb"
            weight={6}
            opacity={0.9}
            dashArray={routeMetrics && routeMetrics.warnings.length > 0 ? "8, 8" : undefined}
          />
        )}
      </MapContainer>
    </div>
  );
}