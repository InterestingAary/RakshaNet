'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DisasterProvider } from '@/context/DisasterContext';
import { DemoProvider } from '@/context/DemoContext';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user && pathname !== '/authority/login') {
        router.push('/authority/login');
      } else if (user && pathname === '/authority/login') {
        router.push('/authority');
      }
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AuthorityLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DemoProvider>
        <DisasterProvider>
          <AuthGuard>
            {children}
          </AuthGuard>
        </DisasterProvider>
      </DemoProvider>
    </AuthProvider>
  );
}

