'use client';

import { useState } from 'react';
import { Shield, MapPin, MapPinOff, ChevronDown, User, LogIn, LogOut, X, Loader2, AlertCircle } from 'lucide-react';
import { useDisasterContext } from '@/context/DisasterContext';
import { useLanguage } from '@/context/LanguageContext';
import { useLocationContext } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';
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
  const { activeDisaster, refresh } = useDisasterContext();
  const { locale, setLocale } = useLanguage();
  const { permissionStatus, requestLocation } = useLocationContext();
  const { user, login, logout, isLoading: isAuthLoading } = useAuth();

  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('citizen@example.com');
  const [loginPassword, setLoginPassword] = useState('citizen123!');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const currentLang = LANGUAGE_OPTIONS.find((l) => l.code === locale) ?? LANGUAGE_OPTIONS[0];

  const handleLanguageSelect = (code: string) => {
    setLocale(code as 'en' | 'hi' | 'te');
    setLangOpen(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      await login({ email: loginEmail.trim(), password: loginPassword });
      setIsLoginModalOpen(false);
      await refresh();
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    await refresh();
  };

  return (
    <>
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

          {/* Citizen Auth Control */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 transition-colors"
                id="citizen-user-menu-button"
              >
                <User className="h-3.5 w-3.5 text-blue-400" />
                <span className="truncate max-w-[100px]">{user.name}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 p-2 text-xs">
                    <div className="px-2 py-1.5 border-b border-slate-700 mb-1">
                      <p className="font-semibold text-white truncate">{user.name}</p>
                      <p className="text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 bg-blue-900/60 text-blue-300 border border-blue-700 rounded text-[10px] uppercase font-bold">
                        {user.role}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      id="citizen-logout-button"
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-red-400 hover:bg-red-500/10 hover:text-red-300 text-left transition-colors font-medium"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              id="citizen-login-button"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white text-xs font-medium border border-blue-500/30 transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}

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

      {/* Citizen Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/50">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                Citizen Portal Sign In
              </h3>
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogin} className="p-5 space-y-4">
              {loginError && (
                <div className="p-2.5 bg-red-950/50 border border-red-800 rounded-lg flex items-start gap-2 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Email Address</label>
                <input
                  type="email"
                  required
                  id="citizen-input-email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="citizen@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <input
                  type="password"
                  required
                  id="citizen-input-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  id="citizen-submit-login-button"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('citizen@example.com');
                    setLoginPassword('citizen123!');
                  }}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] transition-colors"
                >
                  Quick Fill: citizen@example.com
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
