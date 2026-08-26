'use client';

import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Info, Users } from 'lucide-react';
import { useDisaster } from '@/hooks/useDisaster';
import { Alert } from '@/types';

export function AlertsPanel() {
  const { alerts } = useDisaster();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!alerts || alerts.length === 0) return null;

  const getBadgeStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case 'official warning':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'system recommendation':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'citizen report':
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'official warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'system recommendation':
        return <Info className="w-4 h-4" />;
      case 'citizen report':
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  // Ensure type exists on Alert, assuming we can map severity/source to these string categories if missing
  // Or assuming Alert has a 'type' property that matches these. Let's make it robust.
  const getType = (alert: Alert) => {
    // If the alert object has a type field we use it, otherwise we guess based on severity
    if ((alert as any).type) return (alert as any).type;
    if (alert.severity === 'critical' || alert.severity === 'high') return 'Official Warning';
    if (alert.severity === 'medium') return 'System Recommendation';
    return 'Citizen Report';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col mb-4">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full"
      >
        <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Active Alerts
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">
            {alerts.length}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-slate-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
          {alerts.map((alert) => {
            const alertType = getType(alert);
            return (
              <div key={alert.id} className="p-4 flex flex-col gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100">
                    {alert.title || alert.message.substring(0, 50)}
                  </h4>
                  <span className={`flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border whitespace-nowrap ${getBadgeStyle(alertType)}`}>
                    {getIcon(alertType)}
                    {alertType}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {alert.message}
                </p>
                <div className="text-xs text-slate-400 mt-1">
                  {new Date(alert.issuedAt).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
