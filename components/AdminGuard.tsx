'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lock,
  LogOut,
  ArrowLeft,
  ShieldCheck,
  Mail,
  Eye,
  EyeOff,
  KeyRound,
  Phone,
  CheckCircle2,
} from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
  authEndpoint?: string;
  requireEmail?: boolean;
  title?: string;
  subtitle?: string;
  badgeLabel?: string;
  pinPlaceholder?: string;
}

export default function AdminGuard({
  children,
  authEndpoint = '/api/admin-auth',
  requireEmail = true,
  title = 'Acceso Privado • Admin',
  subtitle = 'Ingresá con tu Gmail (ID) y tu Contraseña / PIN para gestionar tu tienda.',
  badgeLabel = 'Sesión Admin Activa',
  pinPlaceholder = 'Contraseña / PIN',
}: AdminGuardProps) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [isDefaultEmail, setIsDefaultEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Recuperar contraseña
  const [modoRecuperar, setModoRecuperar] = useState(false);
  const [recEmail, setRecEmail] = useState('');
  const [recWhatsapp, setRecWhatsapp] = useState('');
  const [recNuevoPin, setRecNuevoPin] = useState('');
  const [recSuccess, setRecSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch(authEndpoint, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        setAuthenticated(Boolean(data?.authenticated));
        setIsDefaultEmail(Boolean(data?.isDefaultEmail));
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
        body: JSON.stringify(requireEmail ? { email, pin } : { pin }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(data?.error || 'Credenciales incorrectas');
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

  const handleRecuperar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRecSuccess(null);
    setSubmitting(true);

    try {
      const res = await fetch(authEndpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: recEmail,
          whatsapp: recWhatsapp,
          nuevoPin: recNuevoPin,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(data?.error || 'No se pudo restablecer la contraseña.');
      } else {
        setRecSuccess(
          data.message || 'Contraseña restablecida. Ya podés iniciar sesión.'
        );
        setEmail(recEmail);
        setPin('');
        setTimeout(() => {
          setModoRecuperar(false);
        }, 2000);
      }
    } catch {
      setError('Error al conectar con el servidor.');
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
            {modoRecuperar ? (
              <KeyRound className="w-7 h-7" />
            ) : (
              <Lock className="w-7 h-7" />
            )}
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-gray-900">
              {modoRecuperar ? 'Recuperar Contraseña / PIN' : title}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {modoRecuperar
                ? 'Confirmá tu Gmail y tu WhatsApp registrado para crear una nueva contraseña.'
                : subtitle}
            </p>
          </div>

          {!modoRecuperar ? (
            <form onSubmit={handleLogin} className="space-y-3 text-left">
              {requireEmail && isDefaultEmail && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1.5">
                  <p>
                    <strong>Primer ingreso:</strong> usá el correo inicial{' '}
                    <code className="font-bold">pegueymontecde@gmail.com</code> y luego cambialo por tu Gmail en <strong>Mi Tienda</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setEmail('pegueymontecde@gmail.com')}
                    className="px-2.5 py-1 rounded-lg bg-amber-200/70 hover:bg-amber-200 font-extrabold text-amber-950"
                  >
                    Usar pegueymontecde@gmail.com
                  </button>
                </div>
              )}

              {requireEmail && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Gmail / Correo (ID)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tucorreo@gmail.com"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-brand-bg border border-pink-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-pink"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Contraseña / PIN
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder={pinPlaceholder}
                    className="w-full pl-4 pr-11 py-3 rounded-2xl bg-brand-bg border border-pink-200 text-center text-base font-extrabold tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-pink"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
                  >
                    {showPin ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs font-bold text-rose-600 text-center">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-brand-pink hover:bg-brand-pinkDark text-white font-extrabold text-sm shadow-md transition"
              >
                {submitting ? 'Ingresando...' : 'Entrar al Panel'}
              </button>

              {requireEmail && (
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setRecSuccess(null);
                      setRecEmail(email);
                      setModoRecuperar(true);
                    }}
                    className="text-xs font-bold text-brand-pink hover:underline"
                  >
                    ¿Olvidaste tu contraseña? Recuperar acceso
                  </button>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleRecuperar} className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tu Gmail registrado (ID) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={recEmail}
                    onChange={(e) => setRecEmail(e.target.value)}
                    placeholder="tucorreo@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-brand-bg border border-pink-200 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  WhatsApp registrado en la tienda *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={recWhatsapp}
                    onChange={(e) => setRecWhatsapp(e.target.value)}
                    placeholder="Ej: 0983 637 780"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-brand-bg border border-pink-200 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nueva Contraseña / PIN *
                </label>
                <input
                  type="text"
                  required
                  minLength={4}
                  value={recNuevoPin}
                  onChange={(e) => setRecNuevoPin(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  className="w-full px-4 py-2.5 rounded-2xl bg-brand-bg border border-pink-200 text-sm font-bold text-center"
                />
              </div>

              {error && (
                <p className="text-xs font-bold text-rose-600 text-center">
                  {error}
                </p>
              )}

              {recSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{recSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setModoRecuperar(false);
                  }}
                  className="py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-xs"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-3 rounded-2xl bg-brand-teal text-white font-extrabold text-xs shadow"
                >
                  {submitting ? 'Guardando...' : 'Restablecer Clave'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    );
  }

  return (
    <div>
      <div className="px-4 pt-3 flex items-center justify-between no-print">
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
