'use client';

import {
  AlertTriangle,
  Home,
  Zap,
  Navigation,
  XOctagon,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface LayerState {
  hazards:      boolean;
  shelters:     boolean;
  incidents:    boolean;
  routes:       boolean;
  blockedRoads: boolean;
  teams:        boolean;
}

interface MapControlsProps {
  layers: LayerState;
  onToggleLayer: (layer: keyof LayerState) => void;
}

interface LayerConfig {
  key: keyof LayerState;
  label: string;
  Icon: LucideIcon;
  activeColor: string;
}

const LAYER_CONFIG: LayerConfig[] = [
  { key: 'hazards',      label: 'Hazards',   Icon: AlertTriangle, activeColor: '#ef4444' },
  { key: 'shelters',     label: 'Shelters',  Icon: Home,          activeColor: '#22c55e' },
  { key: 'incidents',    label: 'Incidents', Icon: Zap,           activeColor: '#f97316' },
  { key: 'routes',       label: 'Routes',    Icon: Navigation,    activeColor: '#16a34a' },
  { key: 'blockedRoads', label: 'Blocked',   Icon: XOctagon,      activeColor: '#dc2626' },
  { key: 'teams',        label: 'Teams',     Icon: Users,         activeColor: '#7c3aed' },
];

export default function MapControls({ layers, onToggleLayer }: MapControlsProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 8,
        padding: '8px 6px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        minWidth: 110,
      }}
    >
      <p style={{
        fontSize: '0.625rem',
        fontWeight: 700,
        color: '#94a3b8',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        padding: '0 6px 2px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        marginBottom: 2,
      }}>
        Layers
      </p>

      {LAYER_CONFIG.map(({ key, label, Icon, activeColor }) => {
        const isActive = layers[key];
        return (
          <button
            key={key}
            onClick={() => onToggleLayer(key)}
            title={`${isActive ? 'Hide' : 'Show'} ${label}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 8px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: isActive
                ? `${activeColor}22`
                : 'transparent',
              outline: isActive
                ? `1px solid ${activeColor}55`
                : '1px solid transparent',
              transition: 'background-color 0.15s, outline 0.15s',
            }}
          >
            <Icon
              size={14}
              style={{
                color: isActive ? activeColor : '#64748b',
                flexShrink: 0,
              }}
            />
            <span style={{
              fontSize: '0.75rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#f1f5f9' : '#64748b',
            }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
