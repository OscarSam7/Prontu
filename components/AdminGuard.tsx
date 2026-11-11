'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, LogOut, ArrowLeft, ShieldCheck } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
  authEndpoint?: string;
  title?: string;
  subtitle?: string;
  badgeLabel?: string;
  pinPlaceholder?: string;
}

export default function AdminGuard({
  children,
  authEndpoint = '/api/admin-auth',
  title = 'Acceso Privado • Admin',
  subtitle = 'Ingresá tu PIN de administrador de Pegue y Monte CDE para gestionar reservas, devoluciones y kits.',
  badgeLabel = 'Sesión Admin Activa',
  pinPlaceholder = 'Ingresá tu PIN (ej: 2026)',
}: AdminGuardProps) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(authEndpoint)
      .then((res) => res.json())
      .then((data) => {
        setAuthenticated(Boolean(data?.authenticated));
      })
      .catch(() => {
        setAuthenticated(false);
      })
      .finally(() => setChecking(false));
  }, [authEndpoint]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(authEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(data?.error || 'PIN incorrecto');
        setSubmitting(false);
        return;
      }
      setAuthenticated(true);
      setPin('');
    } catch {
      setError('No se pudo verificar el acceso.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch(authEndpoint, { method: 'DELETE' });
    setAuthenticated(false);
  };

  if (checking) {
    return (
      <main className="px-4 pt-12 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-6 shadow-card border border-pink-100 text-sm font-bold text-gray-600">
          Verificando acceso de administrador...
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="px-4 pt-10 pb-12 max-w-md mx-auto space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white shadow-sm border border-pink-100 text-xs font-bold text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la tienda
        </Link>

        <div className="bg-white rounded-3xl p-6 shadow-soft border border-pink-100 space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-pink-50 text-brand-pink flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-gray-900">
              {title}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {subtitle}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3 text-left">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                PIN de Acceso
              </label>
              <input
                type="password"
                inputMode="numeric"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder={pinPlaceholder}
                className="w-full px-4 py-3 rounded-2xl bg-brand-bg border border-pink-200 text-center text-lg font-extrabold tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-pink"
              />
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-600 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-brand-pink hover:bg-brand-pinkDark text-white font-extrabold text-sm shadow-md transition"
            >
              {submitting ? 'Ingresando...' : 'Entrar al Panel Admin'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div>
      <div className="px-4 pt-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-teal bg-teal-50 px-3 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" /> {badgeLabel}
        </span>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-xs font-bold text-gray-600 hover:text-brand-pink px-2.5 py-1 rounded-xl bg-white border border-gray-200"
          >
            Ver tienda
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-xl bg-white border border-rose-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            Salir
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
