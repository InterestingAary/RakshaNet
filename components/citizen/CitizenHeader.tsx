'use client';

import { useState } from 'react';
import { Shield, MapPin, MapPinOff, ChevronDown } from 'lucide-react';
import { useDisasterContext } from '@/context/DisasterContext';
import { useLanguage } from '@/context/LanguageContext';
import { useLocationContext } from '@/context/LocationContext';
import { cn } from '@/lib/utils';

interface CitizenHeaderProps {
  onOpenHelp: () => void;
}

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'hi', label: 'हिं', full: 'हिन्दी' },
  { code: 'te', label: 'తె', full: 'తెలుగు' },
] as const;

export default function CitizenHeader({ onOpenHelp }: CitizenHeaderProps) {
  const { activeDisaster } = useDisasterContext();
  const { locale, setLocale } = useLanguage();
  const { permissionStatus, requestLocation } = useLocationContext();
  const [langOpen, setLangOpen] = useState(false);

  const currentLang = LANGUAGE_OPTIONS.find((l) => l.code === locale) ?? LANGUAGE_OPTIONS[0];

  const handleLanguageSelect = (code: string) => {
    setLocale(code as 'en' | 'hi' | 'te');
    setLangOpen(false);
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-700 flex items-center px-4 gap-4 shrink-0 z-50">
      {/* Left: Branding */}
      <div className="flex items-center gap-2 shrink-0">
        <Shield className="h-6 w-6 text-blue-400" aria-hidden="true" />
        <div className="leading-tight">
          <span className="text-white font-bold text-sm tracking-wide">AERIS</span>
          <span className="text-slate-400 text-xs block leading-none">Emergency Response</span>
        </div>
      </div>

      {/* Center: Disaster status */}
      <div className="flex-1 flex justify-center">
        {activeDisaster ? (
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold',
              activeDisaster.severity === 'critical'
                ? 'bg-red-900/60 text-red-300 border border-red-700 animate-pulse'
                : activeDisaster.severity === 'high'
                ? 'bg-orange-900/60 text-orange-300 border border-orange-700 animate-pulse'
                : 'bg-yellow-900/60 text-yellow-300 border border-yellow-700',
            )}
            role="status"
            aria-live="polite"
          >
            <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
            <span className="truncate max-w-[200px]">{activeDisaster.name}</span>
            <span className="uppercase text-xs opacity-80 hidden sm:inline">
              {activeDisaster.severity}
            </span>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-green-900/60 text-green-300 border border-green-700"
            role="status"
          >
            <span className="h-2 w-2 rounded-full bg-green-400" aria-hidden="true" />
            All Clear
          </div>
        )}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setLangOpen((o) => !o)}
            className="flex items-center gap-1 px-2 py-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors"
            aria-haspopup="listbox"
            aria-expanded={langOpen}
            aria-label="Select locale"
          >
            {currentLang.label}
            <ChevronDown className="h-3 w-3 opacity-60" aria-hidden="true" />
          </button>
          {langOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setLangOpen(false)}
                aria-hidden="true"
              />
              <ul
                role="listbox"
                aria-label="Language"
                className="absolute right-0 top-full mt-1 w-32 bg-slate-800 border border-slate-700 rounded shadow-lg z-50 py-1"
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <li
                    key={opt.code}
                    role="option"
                    aria-selected={opt.code === locale}
                    onClick={() => handleLanguageSelect(opt.code)}
                    className={cn(
                      'px-3 py-2 text-sm cursor-pointer flex items-center gap-2 transition-colors',
                      opt.code === locale
                        ? 'bg-blue-600/30 text-blue-300'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white',
                    )}
                  >
                    <span className="font-medium">{opt.label}</span>
                    <span className="text-slate-400 text-xs">{opt.full}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Location Status */}
        <button
          onClick={permissionStatus === "granted" ? undefined : requestLocation}
          disabled={permissionStatus === "granted"}
          className={cn(
            'hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium transition-colors',
            permissionStatus === "granted"
              ? 'text-green-400 bg-green-900/30 cursor-default'
              : 'text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-slate-200 cursor-pointer',
          )}
          aria-label={permissionStatus === "granted" ? 'Location is active' : 'Enable location access'}
          title={permissionStatus === "granted" ? 'Location Active' : 'Click to enable location'}
        >
          {permissionStatus === "granted" ? (
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <MapPinOff className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span>{permissionStatus === "granted" ? 'Location: Active' : 'Location: Off'}</span>
        </button>

        {/* Emergency Help Button */}
        <button
          onClick={onOpenHelp}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold rounded text-sm transition-colors shadow-lg shadow-red-900/40"
          aria-label="Open emergency help request"
        >
          <span aria-hidden="true">🆘</span>
          <span>HELP</span>
        </button>
      </div>
    </header>
  );
}
