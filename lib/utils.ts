import type { LatLng, Severity } from '@/types';

/**
 * Merges class names, filtering out falsy values.
 * Lightweight alternative to clsx/classnames.
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Formats a distance in kilometres to a human-readable string.
 * e.g. 3.2 → '3.2 km', 0.5 → '500 m'
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Formats a duration in minutes to a human-readable string.
 * e.g. 90 → '1 hr 30 min', 12 → '12 min'
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

/**
 * Formats a Date to a 12-hour time string.
 * e.g. '10:32 AM'
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Returns a human-readable relative time string.
 * e.g. '5 minutes ago', '2 hours ago', 'just now'
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 30) return 'just now';
  if (diffSec < 60) return `${diffSec} seconds ago`;
  if (diffMin < 2) return '1 minute ago';
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHr < 2) return '1 hour ago';
  if (diffHr < 24) return `${diffHr} hours ago`;
  if (diffDay < 2) return 'yesterday';
  return `${diffDay} days ago`;
}

/**
 * Returns a Tailwind CSS text-color class for a given severity level.
 */
export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case 'critical':
      return 'text-red-500';
    case 'high':
      return 'text-orange-500';
    case 'medium':
      return 'text-yellow-500';
    case 'low':
      return 'text-blue-400';
    default:
      return 'text-slate-400';
  }
}

/**
 * Returns a Tailwind CSS background-color class for priority levels 1–4.
 * 1 = highest priority (critical), 4 = lowest.
 */
export function getPriorityColor(level: 1 | 2 | 3 | 4): string {
  switch (level) {
    case 1:
      return 'bg-red-600';
    case 2:
      return 'bg-orange-500';
    case 3:
      return 'bg-yellow-500';
    case 4:
      return 'bg-blue-500';
    default:
      return 'bg-slate-500';
  }
}

/**
 * Calculates shelter utilization as a percentage (0–100), capped at 100.
 */
export function calculateUtilizationPercent(
  occupancy: number,
  capacity: number
): number {
  if (capacity <= 0) return 0;
  return Math.min(100, Math.round((occupancy / capacity) * 100));
}

/**
 * Calculates the great-circle distance between two lat/lng points using
 * the Haversine formula. Returns distance in kilometres.
 */
export function haversineDistance(a: LatLng, b: LatLng): number {
  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const aVal =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng;

  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  return R * c;
}
