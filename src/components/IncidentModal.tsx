import React, { useState } from "react";

interface IncidentModalProps {
  coord: [number, number];
  onClose: () => void;
  onSubmit: (type: string, severity: "LOW" | "MEDIUM" | "HIGH") => void;
}

export const IncidentModal: React.FC<IncidentModalProps> = ({ coord, onClose, onSubmit }) => {
  const [incidentType, setIncidentType] = useState("FALLEN_TREE");
  const [severity, setSeverity] = useState<"LOW" | "MEDIUM" | "HIGH">("HIGH");

  return (
    <div style={{
      position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
      zIndex: 2000, background: "#0f172a", color: "#fff", padding: "20px",
      borderRadius: "10px", width: "320px", boxShadow: "0 10px 30px rgba(0,0,0,0.6)"
    }}>
      <h4 style={{ margin: "0 0 10px 0", color: "#f87171" }}>Report Road Obstacle</h4>
      <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 12px 0" }}>
        GPS: {coord[0].toFixed(4)}, {coord[1].toFixed(4)}
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
        value={severity} 
        onChange={(e) => setSeverity(e.target.value as "LOW" | "MEDIUM" | "HIGH")}
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
          onClick={() => onSubmit(incidentType, severity)}
          style={{ flex: 1, padding: "8px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
        >
          Submit Report
        </button>
        <button 
          onClick={onClose}
          style={{ flex: 1, padding: "8px", background: "#334155", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};