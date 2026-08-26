'use client';

import React, { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  title?: string;
  icon?: ReactNode;
}

export default function EmptyState({ message, title, icon }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-10 gap-3 text-center"
      role="status"
    >
      <div className="p-3 bg-slate-700/50 rounded-full text-slate-500">
        {icon ?? <Inbox className="h-6 w-6" aria-hidden="true" />}
      </div>
      <div>
        {title && <p className="text-sm font-semibold text-slate-300">{title}</p>}
        <p className={`text-xs text-slate-500 max-w-xs ${title ? 'mt-1' : ''}`}>{message}</p>
      </div>
    </div>
  );
}
