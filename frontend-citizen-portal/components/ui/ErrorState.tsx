'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  title?: string;
}

export default function ErrorState({
  message,
  onRetry,
  title = 'Unable to load data',
}: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-10 gap-3 text-center"
      role="alert"
    >
      <div className="p-3 bg-red-900/20 rounded-full">
        <AlertTriangle className="h-6 w-6 text-red-400" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-xs text-slate-400 max-w-xs">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 text-xs font-semibold rounded-md
            bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white
            transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          <RefreshCw className="h-3 w-3" aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}
