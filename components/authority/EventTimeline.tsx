'use client';

import React from 'react';
import { TimelineEvent } from '@/types/timeline';
import { format } from 'date-fns';

interface EventTimelineProps {
  events: TimelineEvent[];
  maxItems?: number;
}

export default function EventTimeline({ events, maxItems = 10 }: EventTimelineProps) {
  const displayEvents = events.slice(0, maxItems);

  const getEventColor = (type: string) => {
    switch (type) {
      case 'alert':
      case 'incident':
        return 'bg-red-500 shadow-red-500/50';
      case 'update':
        return 'bg-blue-500 shadow-blue-500/50';
      case 'resolution':
        return 'bg-emerald-500 shadow-emerald-500/50';
      default:
        return 'bg-slate-500 shadow-slate-500/50';
    }
  };

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-400">
        <p>No events recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="relative border-l border-slate-700 ml-4 py-2 space-y-6">
      {displayEvents.map((event) => (
        <div key={event.id} className="relative pl-6">
          <div 
            className={`absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${getEventColor(event.type)}`}
          />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-400 mb-1">
              {format(new Date(event.timestamp), 'MMM d, yyyy HH:mm')}
            </span>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-white mb-1">{event.title}</h4>
              <p className="text-sm text-slate-300">{event.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
