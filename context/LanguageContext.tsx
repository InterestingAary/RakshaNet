'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { type Locale, LOCALES } from '@/lib/i18n';

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'sih_locale';

function isValidLocale(value: string): value is Locale {
  return (LOCALES as string[]).includes(value);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLocale?: Locale;
}

export function LanguageProvider({
  children,
  defaultLocale = 'en',
}: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && isValidLocale(stored)) {
        setLocaleState(stored);
      }
    } catch {
      // localStorage not available (SSR safety)
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // ignore storage errors
    }
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, setLocale }),
    [locale, setLocale]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
