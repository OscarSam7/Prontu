'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MapPin,
  PartyPopper,
  PauseCircle,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { PLANES_SAAS } from '@/lib/saas';
import KitCard from '@/components/KitCard';

export default function TiendaSuscriptorPage() {
  const params = useParams();
  const slug = String(params?.slug || '');
  const { negocios, kits } = useApp();

  const negocio = negocios.find((n) => n.slug === slug);

  if (!negocio) {
    return (
      <main className="px-4 pt-12 pb-12 max-w-md mx-auto text-center space-y-4">
        <div className="bg-white rounded-3xl p-6 shadow-card border border-pink-100 space-y-3">
          <h1 className="text-xl font-extrabold text-gray-900">
            Tienda no encontrada
          </h1>
          <p className="text-xs text-gray-500">
            La dirección <code>/tienda/{slug}</code> no corresponde a ningún negocio activo.
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2.5 rounded-2xl bg-brand-pink text-white text-xs font-extrabold"
          >
            Ir a Pegue y Monte CDE
          </Link>
        </div>
      </main>
    );
  }

  if (negocio.estado === 'suspendido') {
    return (
      <main className="px-4 pt-12 pb-12 max-w-md mx-auto text-center space-y-4">
        <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-rose-200 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <PauseCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-extrabold text-gray-900">
            {negocio.nombre} — Temporalmente Pausada
          </h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            La suscripción de esta tienda se encuentra pendiente de renovación. Si sos el dueño, contactá con el administrador de la plataforma para reactivarla al instante.
          </p>
          <Link
            href="/super-admin"
            className="inline-block px-4 py-2.5 rounded-2xl bg-gray-900 text-white text-xs font-extrabold"
          >
            Ir al Super Admin
          </Link>
        </div>
      </main>
    );
  }

  const limite = PLANES_SAAS[negocio.plan].limiteKits;
  const kitsVisibles = limite ? kits.slice(0, limite) : kits;

  return (
    <main className="px-4 pt-4 pb-10 space-y-5">
      {/* Header personalizado del Negocio Suscriptor */}
      <header
        className="rounded-3xl p-5 text-white shadow-soft space-y-3"
        style={{ backgroundColor: negocio.colorPrimario }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <PartyPopper className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full">
                {negocio.estado === 'prueba' ? 'Demo Prueba Gratis' : PLANES_SAAS[negocio.plan].nombre}
              </span>
              <h1 className="text-xl font-extrabold leading-tight mt-0.5">
                {negocio.nombre}
              </h1>
              <p className="text-xs text-white/90 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {negocio.ciudad}
              </p>
            </div>
          </div>

          <a
            href={`https://wa.me/${
              negocio.whatsapp.replace(/\D/g, '').startsWith('595')
                ? negocio.whatsapp.replace(/\D/g, '')
                : `595${negocio.whatsapp.replace(/^0|\D/g, '')}`
            }`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-2xl bg-white text-gray-900 text-xs font-extrabold flex items-center gap-1.5 shadow shrink-0"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            WhatsApp
          </a>
        </div>

        <div className="text-xs bg-black/15 rounded-2xl px-3.5 py-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Alias SIPAP: <strong>{negocio.aliasSipap || negocio.whatsapp}</strong>
          </span>
          <span>{kitsVisibles.length} kits habilitados</span>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {kitsVisibles.map((kit) => (
          <KitCard key={kit.id} kit={kit} />
        ))}
      </section>
    </main>
  );
}
