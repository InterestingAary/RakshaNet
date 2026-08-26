'use client';

import React from 'react';

type LoadingSize = 'sm' | 'md' | 'lg';

interface LoadingStateProps {
  message?: string;
  size?: LoadingSize;
}

const sizeConfig: Record<LoadingSize, { ring: string; text: string; gap: string }> = {
  sm: { ring: 'h-5 w-5 border-2', text: 'text-xs', gap: 'gap-2' },
  md: { ring: 'h-8 w-8 border-2', text: 'text-sm', gap: 'gap-3' },
  lg: { ring: 'h-12 w-12 border-[3px]', text: 'text-base', gap: 'gap-4' },
};

export default function LoadingState({ message = 'Loading...', size = 'md' }: LoadingStateProps) {
  const { ring, text, gap } = sizeConfig[size];

  return (
    <div className={`flex flex-col items-center justify-center py-10 ${gap}`} role="status" aria-live="polite">
      <div
        className={`${ring} rounded-full border-slate-600 border-t-blue-400 animate-spin`}
        aria-hidden="true"
      />
      <p className={`${text} text-slate-400 font-medium`}>{message}</p>
    </div>
  );
}
