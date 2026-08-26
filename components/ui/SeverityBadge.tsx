'use client';

import React from 'react';
import Badge from './Badge';

type Severity = 'low' | 'medium' | 'high' | 'critical';

interface SeverityBadgeProps {
  severity: Severity;
}

const severityMap: Record<Severity, { variant: 'danger' | 'warning' | 'caution' | 'info'; label: string }> = {
  critical: { variant: 'danger',  label: 'Critical' },
  high:     { variant: 'warning', label: 'High' },
  medium:   { variant: 'caution', label: 'Medium' },
  low:      { variant: 'info',    label: 'Low' },
};

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const { variant, label } = severityMap[severity];
  return <Badge variant={variant} label={label} />;
}
