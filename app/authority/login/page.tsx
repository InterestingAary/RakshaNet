'use client';

// Demo credentials are managed in authService.ts — never hardcode credentials in UI.

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Shield, Eye, EyeOff, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { LoginCredentials } from '@/types';

export default function AuthorityLoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginCredentials) => {
    setSubmitError(null);
    try {
      await login(data);
      router.replace('/authority');
    } catch {
      setSubmitError(
        'Sign-in failed. Please verify your credentials and try again.'
      );
    }
  };

  const busy = isSubmitting || isLoading;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-red-700 via-red-500 to-orange-500" />

          <div className="px-8 py-10">
            <div className="flex flex-col items-center gap-3 mb-8">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-950 border border-red-800">
                <Shield className="h-7 w-7 text-red-400" />
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Government Emergency Operations
                </h1>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  SIH26191 — Adaptive Evacuation &amp; Relocation Intelligence System
                </p>
              </div>

              <div className="mt-1 flex items-center gap-1.5 px-3 py-1 bg-red-950/60 border border-red-800/50 rounded-full">
                <span className="block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-semibold text-red-400 uppercase tracking-widest">
                  Authorized Personnel Only
                </span>
              </div>
            </div>

            {submitError && (
              <div className="mb-5 flex items-start gap-2.5 p-3 bg-red-950/50 border border-red-800 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-300">{submitError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  Official ID / Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  disabled={busy}
                  placeholder="authority@ndma.gov.in"
                  className={[
                    'w-full px-3.5 py-2.5 bg-slate-800 border rounded-lg text-sm text-white',
                    'placeholder-slate-500 focus:outline-none focus:ring-2 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    errors.email
                      ? 'border-red-600 focus:ring-red-600/40'
                      : 'border-slate-600 focus:border-slate-500 focus:ring-slate-500/30',
                  ].join(' ')}
                  {...register('email', {
                    required: 'Official ID / Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address',
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    disabled={busy}
                    placeholder="••••••••••••"
                    className={[
                      'w-full px-3.5 py-2.5 pr-10 bg-slate-800 border rounded-lg text-sm text-white',
                      'placeholder-slate-500 focus:outline-none focus:ring-2 transition-colors',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      errors.password
                        ? 'border-red-600 focus:ring-red-600/40'
                        : 'border-slate-600 focus:border-slate-500 focus:ring-slate-500/30',
                    ].join(' ')}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 4, message: 'Password is too short' },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={busy}
                className={[
                  'w-full flex items-center justify-center gap-2',
                  'py-2.5 px-4 rounded-lg text-sm font-semibold',
                  'bg-red-700 hover:bg-red-600 text-white',
                  'focus:outline-none focus:ring-2 focus:ring-red-600/50',
                  'transition-all duration-150',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                ].join(' ')}
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign In to Operations Center'
                )}
              </button>
            </form>
          </div>

          <div className="px-8 py-4 bg-slate-950/60 border-t border-slate-800">
            <p className="text-center text-xs text-slate-600">
              Access is monitored and logged. Unauthorized access is prohibited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
