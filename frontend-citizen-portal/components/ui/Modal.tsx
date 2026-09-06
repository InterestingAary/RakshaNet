'use client';

import React, { ReactNode, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: ModalSize;
  footer?: ReactNode;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={[
          'relative w-full bg-slate-800 rounded-lg border border-slate-700',
          'shadow-2xl flex flex-col max-h-[90vh]',
          sizeClasses[size],
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 shrink-0">
          <h2 id="modal-title" className="text-base font-semibold text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-700 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
