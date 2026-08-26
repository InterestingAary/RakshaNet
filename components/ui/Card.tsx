'use client';

import React, { ReactNode } from 'react';

type CardStatus = 'normal' | 'warning' | 'critical' | 'success';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
  status?: CardStatus;
  noPadding?: boolean;
}

const statusBorderClasses: Record<CardStatus, string> = {
  normal:   'border-l-slate-600',
  warning:  'border-l-orange-500',
  critical: 'border-l-red-500',
  success:  'border-l-emerald-500',
};

export default function Card({
  title,
  subtitle,
  children,
  className = '',
  actions,
  status = 'normal',
  noPadding = false,
}: CardProps) {
  return (
    <div
      className={[
        'bg-slate-800 rounded-lg border border-slate-700 border-l-4',
        statusBorderClasses[status],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {(title || actions) && (
        <div className="flex items-start justify-between px-4 py-3 border-b border-slate-700">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-white leading-tight">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 ml-4">{actions}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-4'}>{children}</div>
    </div>
  );
}
