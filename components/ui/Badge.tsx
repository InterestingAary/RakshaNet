'use client';

import React from 'react';

type BadgeVariant = 'danger' | 'warning' | 'caution' | 'success' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
  size?: BadgeSize;
  pulse?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  danger:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  warning: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  caution: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  info:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export default function Badge({ variant, label, size = 'sm', pulse = false }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center font-semibold rounded-full',
        variantClasses[variant],
        sizeClasses[size],
        pulse ? 'animate-pulse' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label}
    </span>
  );
}
