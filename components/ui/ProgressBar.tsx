'use client';

import React from 'react';

type ProgressVariant = 'default' | 'warning' | 'danger';

interface ProgressBarProps {
  value: number;
  label?: string;
  variant?: ProgressVariant;
}

function resolveVariant(value: number, variant: ProgressVariant): ProgressVariant {
  if (variant !== 'default') return variant;
  if (value > 80) return 'danger';
  if (value > 60) return 'warning';
  return 'default';
}

const trackClasses: Record<ProgressVariant, string> = {
  default: 'bg-blue-500',
  warning: 'bg-orange-500',
  danger:  'bg-red-500',
};

export default function ProgressBar({ value, label, variant = 'default' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const resolved = resolveVariant(clamped, variant);

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-400">{label}</span>
          <span className={`text-xs font-semibold ${resolved === 'danger' ? 'text-red-400' : resolved === 'warning' ? 'text-orange-400' : 'text-blue-400'}`}>
            {clamped}%
          </span>
        </div>
      )}
      <div
        className="w-full h-2 bg-slate-700 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${trackClasses[resolved]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
