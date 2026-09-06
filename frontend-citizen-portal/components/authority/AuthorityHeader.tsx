'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDemo } from '@/context/DemoContext';
import { ShieldAlert, LogOut, Play, Square } from 'lucide-react';
import { useDisasterContext } from '@/context/DisasterContext';

export default function AuthorityHeader() {
  const { user, logout } = useAuth();
  const { isDemoMode, enableDemoMode, disableDemoMode } = useDemo();
  const { activeDisaster } = useDisasterContext();

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'monitoring':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'resolved':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-indigo-400">
          <ShieldAlert className="w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tight text-white">AERIS</h1>
          <span className="text-slate-400 text-sm font-medium ml-2 border-l border-slate-700 pl-4">
            Operations Center
          </span>
        </div>
        
        {activeDisaster && (
          <div className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStatusColor(activeDisaster.status)}`}>
            {activeDisaster.name} ({activeDisaster.status})
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 border-r border-slate-700 pr-6">
          <span className="text-sm text-slate-400">Demo Mode</span>
          <button
            onClick={isDemoMode ? disableDemoMode : enableDemoMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              isDemoMode ? 'bg-indigo-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isDemoMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-white">{user?.name || 'Commander'}</span>
            <span className="text-xs text-slate-400">{user?.role === 'admin' ? 'System Admin' : 'Authority'}</span>
          </div>
          
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
