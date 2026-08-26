'use client';

import React, { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type KPIVariant = 'default' | 'warning' | 'danger' | 'success';
type TrendDirection = 'up' | 'down' | 'neutral';

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: TrendDirection;
  trendLabel?: string;
  variant?: KPIVariant;
  icon?: ReactNode;
  subValue?: string;
}

const variantBorderClasses: Record<KPIVariant, string> = {
  default: 'border-l-slate-600',
  warning: 'border-l-orange-500',
  danger:  'border-l-red-500',
  success: 'border-l-emerald-500',
};

const variantValueClasses: Record<KPIVariant, string> = {
  default: 'text-white',
  warning: 'text-orange-400',
  danger:  'text-red-400',
  success: 'text-emerald-400',
};

const trendConfig: Record<
  TrendDirection,
  { Icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  up:      { Icon: TrendingUp,   color: 'text-emerald-400' },
  down:    { Icon: TrendingDown, color: 'text-red-400' },
  neutral: { Icon: Minus,        color: 'text-slate-400' },
};

export default function KPICard({
  label,
  value,
  unit,
  trend,
  trendLabel,
  variant = 'default',
  icon,
  subValue,
}: KPICardProps) {
  const trendInfo = trend ? trendConfig[trend] : null;

  return (
    <div
      className={[
        'bg-slate-800 rounded-lg border border-slate-700 border-l-4 p-4',
        variantBorderClasses[variant],
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide leading-tight">
          {label}
        </p>
        {icon && <span className="text-slate-500 shrink-0">{icon}</span>}
      </div>

      <div className="mt-2 flex items-end gap-1">
        <span className={`text-2xl font-bold leading-none ${variantValueClasses[variant]}`}>
          {value}
        </span>
        {unit && <span className="text-sm text-slate-400 mb-0.5">{unit}</span>}
      </div>

      {subValue && (
        <p className="mt-1 text-xs text-slate-500">{subValue}</p>
      )}

      {trendInfo && (
        <div className={`mt-2 flex items-center gap-1 text-xs ${trendInfo.color}`}>
          <trendInfo.Icon className="h-3 w-3" />
          {trendLabel && <span>{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
