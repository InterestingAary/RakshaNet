import React from "react";

interface EscalationPayloadProps {
  data: any;
}

export const EscalationPayload: React.FC<EscalationPayloadProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div style={{
      position: "absolute", bottom: 20, right: 20, zIndex: 1000, width: "360px",
      background: "rgba(24, 0, 0, 0.95)", border: "1px solid #dc2626", color: "#fff",
      padding: "16px", borderRadius: "8px", fontSize: "11px", boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
    }}>
      <strong style={{ color: "#f87171", display: "block", marginBottom: "6px" }}>
        🚨 Authority Rescue Dispatch Payload
      </strong>
      <pre style={{ margin: 0, overflowX: "auto", background: "#000", padding: "8px", borderRadius: "4px", color: "#4ade80" }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};