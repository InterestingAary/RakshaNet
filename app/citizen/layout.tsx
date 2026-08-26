import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Citizen Portal - AERIS',
  description: 'Emergency Evacuation & Relocation Intelligence System',
};

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      {children}
    </main>
  );
}
