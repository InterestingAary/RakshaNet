'use client';

import React from 'react';

type IndicatorStatus = 'active' | 'inactive' | 'warning' | 'critical' | 'safe' | 'unknown';
type IndicatorSize = 'sm' | 'md';

interface StatusIndicatorProps {
  status: IndicatorStatus;
  label: string;
  size?: IndicatorSize;
  showDot?: boolean;
}

const dotClasses: Record<IndicatorStatus, string> = {
  active:   'bg-emerald-400',
  inactive: 'bg-slate-500',
  warning:  'bg-orange-400',
  critical: 'bg-red-500',
  safe:     'bg-emerald-500',
  unknown:  'bg-slate-600',
};

const labelClasses: Record<IndicatorStatus, string> = {
  active:   'text-emerald-400',
  inactive: 'text-slate-500',
  warning:  'text-orange-400',
  critical: 'text-red-400',
  safe:     'text-emerald-400',
  unknown:  'text-slate-500',
};

const animatedStatuses: Set<IndicatorStatus> = new Set(['active', 'critical']);

const sizeConfig: Record<IndicatorSize, { dot: string; text: string }> = {
  sm: { dot: 'h-1.5 w-1.5', text: 'text-xs' },
  md: { dot: 'h-2.5 w-2.5', text: 'text-sm' },
};

export default function StatusIndicator({
  status,
  label,
  size = 'sm',
  showDot = true,
}: StatusIndicatorProps) {
  const { dot, text } = sizeConfig[size];
  const isAnimated = animatedStatuses.has(status);

  return (
    <div className="inline-flex items-center gap-1.5">
      {showDot && (
        <span className="relative inline-flex">
          {isAnimated && (
            <span
              className={`absolute inline-flex h-full w-full rounded-full ${dotClasses[status]} opacity-75 animate-ping`}
            />
          )}
          <span className={`relative inline-flex rounded-full ${dot} ${dotClasses[status]}`} />
        </span>
      )}
      <span className={`font-medium ${text} ${labelClasses[status]}`}>{label}</span>
    </div>
  );
}
