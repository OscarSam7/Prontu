'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  CalendarCheck,
  QrCode,
  ShieldCheck,
  Crown,
  ArrowRight,
  Store,
  Send,
} from 'lucide-react';
import { formatGuaranies } from '@/lib/kits';
import { PLANES_SAAS, PlanSaaS, Negocio, slugifyNegocio } from '@/lib/saas';
import { useApp } from '@/lib/store';

export default function VenderSaaSPage() {
  const { crearNegocio } = useApp();

  const [nombreNegocio, setNombreNegocio] = useState('');
  const [duenoNombre, setDuenoNombre] = useState('');
  const [ciudad, setCiudad] = useState('Asunción - Paraguay');
  const [whatsapp, setWhatsapp] = useState('');
  const [aliasSipap, setAliasSipap] = useState('');
  const [plan, setPlan] = useState<PlanSaaS>('pro');
  const [pinAdmin, setPinAdmin] = useState('2026');
  const [creado, setCreado] = useState<Negocio | null>(null);

  const handleCrearPrueba = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreNegocio.trim() || !whatsapp.trim() || !duenoNombre.trim()) return;

    const nuevo = crearNegocio({
      nombre: nombreNegocio,
      slug: slugifyNegocio(nombreNegocio),
      ciudad,
      duenoNombre,
      whatsapp,
      aliasSipap: aliasSipap || whatsapp,
      colorPrimario: '#FF4D7A',
      plan,
      estado: 'prueba',
      pinAdmin: pinAdmin || '2026',
    });

    setCreado(nuevo);
  };

  if (creado) {
    return (
      <main className="px-4 pt-8 pb-14 max-w-lg mx-auto space-y-5">
        <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-brand-teal space-y-5 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-brand-teal flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-teal-50 text-brand-teal text-xs font-extrabold">
              PRUEBA GRATIS 14 DÍAS ACTIVADA
            </span>
            <h1 className="text-2xl font-extrabold text-gray-900">
              ¡Tu tienda &ldquo;{creado.nombre}&rdquo; ya está lista!
            </h1>
            <p className="text-xs text-gray-500">
              Ya cargamos 3 kits de ejemplo para que puedas probar todo al instante.
            </p>
          </div>

          <div className="bg-brand-bg rounded-2xl p-4 text-left space-y-2 text-xs border border-pink-100">
            <p>
              🌐 <strong>Link para tus clientes:</strong>{' '}
              <code className="text-brand-pink font-bold">
                /tienda/{creado.slug}
              </code>
            </p>
            <p>
              🔒 <strong>Tu Panel Admin privado:</strong>{' '}
              <code className="text-gray-900 font-bold">
                /tienda/{creado.slug}/admin
              </code>
            </p>
            <p>
              🔑 <strong>Tu PIN de Admin:</strong>{' '}
              <strong className="text-brand-pink">{creado.pinAdmin}</strong>
            </p>
            <p>
              📅 <strong>Prueba válida hasta:</strong> {creado.fechaVencimiento}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href={`/tienda/${creado.slug}`}
              className="py-3.5 px-4 rounded-2xl bg-brand-pink text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow"
            >
              <Store className="w-4 h-4" />
              Abrir Mi Tienda
            </Link>
            <Link
              href={`/tienda/${creado.slug}/admin`}
              className="py-3.5 px-4 rounded-2xl bg-gray-900 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow"
            >
              Entrar a Mi Admin →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 pt-6 pb-16 max-w-3xl mx-auto space-y-8">
      {/* Hero Comercial */}
      <section className="bg-gradient-to-br from-brand-pink via-rose-500 to-brand-gold rounded-3xl p-6 sm:p-8 text-white shadow-soft space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-extrabold">
          <Sparkles className="w-4 h-4" /> Sistema #1 en Paraguay para Alquiler de Fiestas
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight">
          Tené tu propia App Web de Pegue y Monte y Audiovisual en 1 minuto
        </h1>
        <p className="text-sm text-pink-50 max-w-2xl">
          Dejá de responder precios uno por uno por WhatsApp. Tus clientes ven tus kits, eligen fecha en calendario, pagan la seña del 50% y reciben su código QR automáticamente.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-bold">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 shrink-0" />
            <span>Calendario anti doble-reserva</span>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-2">
            <QrCode className="w-5 h-5 shrink-0" />
            <span>Seña 50% + QR de retiro PDF</span>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>Control automático de garantías</span>
          </div>
        </div>
      </section>

      {/* Planes */}
      <section className="space-y-3">
        <h2 className="text-xl font-extrabold text-gray-900 text-center">
          Elegí tu Plan (14 días de prueba gratis)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.values(PLANES_SAAS).map((p) => {
            const selected = plan === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlan(p.id)}
                className={`text-left rounded-3xl p-5 border-2 transition-all flex flex-col justify-between space-y-3 ${
                  selected
                    ? 'border-brand-pink bg-white shadow-soft scale-[1.02]'
                    : 'border-pink-100 bg-white hover:border-pink-200'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-brand-pink uppercase">
                      {p.nombre}
                    </span>
                    {p.id === 'pro' && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold flex items-center gap-1">
                        <Crown className="w-3 h-3" /> Popular
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-extrabold text-gray-900">
                    {formatGuaranies(p.precioMensual)}
                    <span className="text-xs font-medium text-gray-400"> / mes</span>
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {p.descripcion}
                  </p>
                </div>

                <span
                  className={`text-xs font-extrabold ${
                    selected ? 'text-brand-pink' : 'text-gray-400'
                  }`}
                >
                  {selected ? '✓ Plan seleccionado' : 'Seleccionar plan'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Formulario de Registro Instantáneo 14 días gratis */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-pink-100 space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
            Activá tu Prueba Gratis de 14 Días ahora
          </h2>
          <p className="text-xs text-gray-500">
            Sin tarjeta de crédito. Te creamos tu tienda al instante con 3 kits de ejemplo.
          </p>
        </div>

        <form onSubmit={handleCrearPrueba} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Nombre de tu Negocio *
              </label>
              <input
                type="text"
                required
                value={nombreNegocio}
                onChange={(e) => setNombreNegocio(e.target.value)}
                placeholder="Ej: Deco Party Asunción"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Tu Nombre y Apellido *
              </label>
              <input
                type="text"
                required
                value={duenoNombre}
                onChange={(e) => setDuenoNombre(e.target.value)}
                placeholder="Ej: Sofía González"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Tu WhatsApp (recibe reservas) *
              </label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ej: 0981 555 222"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Ciudad *
              </label>
              <input
                type="text"
                required
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                placeholder="Ciudad del Este / Asunción / Encarnación"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Tu Alias SIPAP para cobrar señas
              </label>
              <input
                type="text"
                value={aliasSipap}
                onChange={(e) => setAliasSipap(e.target.value)}
                placeholder="CI, RUC o Celular (ej: 4582910)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                PIN secreto para entrar a tu Admin
              </label>
              <input
                type="text"
                required
                value={pinAdmin}
                onChange={(e) => setPinAdmin(e.target.value)}
                placeholder="Ej: 2026"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-brand-pink hover:bg-brand-pinkDark text-white font-extrabold text-sm sm:text-base shadow-lg flex items-center justify-center gap-2 transition"
          >
            Crear Mi Tienda Gratis por 14 Días
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="pt-2 border-t border-gray-100 text-center">
          <a
            href="https://wa.me/595983637780?text=Hola!%20Quiero%20consultar%20por%20el%20sistema%20Pegue%20y%20Monte"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
          >
            <Send className="w-3.5 h-3.5" />
            ¿Tenés dudas? Escribinos por WhatsApp (0983 637 780)
          </a>
        </div>
      </section>
    </main>
  );
}
