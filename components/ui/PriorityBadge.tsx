'use client';

import React from 'react';
import Badge from './Badge';

type PriorityLevel = 1 | 2 | 3 | 4;

interface PriorityBadgeProps {
  level: PriorityLevel;
  label?: string;
}

const priorityMap: Record<
  PriorityLevel,
  { variant: 'danger' | 'warning' | 'caution' | 'info'; defaultLabel: string }
> = {
  1: { variant: 'danger',  defaultLabel: 'P1 · Critical' },
  2: { variant: 'warning', defaultLabel: 'P2 · High' },
  3: { variant: 'caution', defaultLabel: 'P3 · Elevated' },
  4: { variant: 'info',    defaultLabel: 'P4 · Standard' },
};

export default function PriorityBadge({ level, label }: PriorityBadgeProps) {
  const { variant, defaultLabel } = priorityMap[level];
  return <Badge variant={variant} label={label ?? defaultLabel} />;
}
