import React from "react";

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

interface RouteMetrics {
  distanceKm: number;
  etaMins: number;
  safetyScore: number;
  warnings: string[];
}

interface ControlHubProps {
  hazardCount: number;
  routeMetrics: RouteMetrics | null;
  activeShelter: Shelter | null;
  onAutoSelect: () => void;
}

export const ControlHub: React.FC<ControlHubProps> = ({
  hazardCount,
  routeMetrics,
  activeShelter,
  onAutoSelect,
}) => {
  return (
    <div style={{
      position: "absolute", top: 64, left: 16, zIndex: 1000, width: "320px",
      background: "rgba(15, 23, 42, 0.95)", color: "#fff", padding: "16px",
      borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", backdropFilter: "blur(6px)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <strong style={{ color: "#38bdf8", fontSize: "15px" }}>RakshaNet Control Hub</strong>
        <span style={{ fontSize: "11px", background: "#1e293b", padding: "3px 8px", borderRadius: "4px" }}>
          {hazardCount} Hazards
        </span>
      </div>

      <button
        onClick={onAutoSelect}
        style={{
          width: "100%", padding: "10px", background: "#0284c7", color: "#fff",
          border: "none", borderRadius: "6px", fontWeight: "bold", fontSize: "13px",
          cursor: "pointer", marginBottom: "8px"
        }}
      >
        Auto-Select Safest Shelter
      </button>

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
  );
};