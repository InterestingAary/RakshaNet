'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { AuthUser, LoginCredentials } from '@/types';
import { authService } from '@/services/authService';

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = 'sih_auth_session';

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  // Check for existing session on mount
  useEffect(() => {
    mountedRef.current = true;

    const restoreSession = async () => {
      try {
        const stored = localStorage.getItem(SESSION_KEY) ?? localStorage.getItem('sih_auth_user');
        if (!stored) {
          if (mountedRef.current) setIsLoading(false);
          return;
        }

        const parsed = JSON.parse(stored) as Partial<AuthUser>;
        const token = typeof parsed.token === 'string' ? parsed.token : '';
        if (!token) {
          localStorage.removeItem(SESSION_KEY);
          localStorage.removeItem('sih_auth_user');
          if (mountedRef.current) setIsLoading(false);
          return;
        }

        const validated = await authService.validateSession(token);
        if (mountedRef.current) {
          if (validated) {
            setUser(validated);
            localStorage.setItem(SESSION_KEY, JSON.stringify(validated));
            localStorage.setItem('sih_auth_user', JSON.stringify(validated));
          } else {
            localStorage.removeItem(SESSION_KEY);
            localStorage.removeItem('sih_auth_user');
            setUser(null);
          }
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem('sih_auth_user');
        if (mountedRef.current) setUser(null);
      } finally {
        if (mountedRef.current) setIsLoading(false);
      }
    };

    restoreSession();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const authedUser = await authService.login(credentials);
      localStorage.setItem(SESSION_KEY, JSON.stringify(authedUser));
      setUser(authedUser);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch {
      // Proceed with client-side logout even if server call fails
    } finally {
      localStorage.removeItem(SESSION_KEY);
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token: user?.token ?? null,
      isAuthenticated: user !== null,
      isLoading,
      login,
      logout,
      error,
    }),
    [user, isLoading, login, logout, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
