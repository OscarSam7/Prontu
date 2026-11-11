'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MapPin,
  PartyPopper,
  PauseCircle,
  MessageCircle,
  Sparkles,
  Search,
  Crown,
} from 'lucide-react';
import { CategoriaFiltro } from '@/lib/kits';
import { PLANES_SAAS } from '@/lib/saas';
import { useApp } from '@/lib/store';
import KitCard from '@/components/KitCard';

const FILTROS: CategoriaFiltro[] = [
  'Todos',
  'Deco',
  'Sonido',
  'Luces',
  'Pantallas',
  'Combo Total',
  'Cumple',
  '15 Años',
  'Bautismo',
  'Boda',
];

export default function TiendaSuscriptorPage() {
  const params = useParams();
  const slug = String(params?.slug || '');
  const { negocios, getKitsByNegocio, esDecoradora, toggleDecoradora } = useApp();

  const [busqueda, setBusqueda] = useState('');
  const [filtroActivo, setFiltroActivo] = useState<CategoriaFiltro>('Todos');

  const negocio = negocios.find((n) => n.slug === slug);

  useEffect(() => {
    if (negocio) {
      document.title = `${negocio.nombre} | Alquiler de Kits`;
    }
  }, [negocio]);

  const kitsBase = useMemo(() => {
    if (!negocio) return [];
    const storeKits = getKitsByNegocio(negocio.id);
    const limite = PLANES_SAAS[negocio.plan].limiteKits;
    return limite ? storeKits.slice(0, limite) : storeKits;
  }, [negocio, getKitsByNegocio]);

  const kitsFiltrados = useMemo(() => {
    return kitsBase.filter((kit) => {
      const coincideTexto =
        kit.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        kit.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
        kit.descripcion.toLowerCase().includes(busqueda.toLowerCase());

      if (!coincideTexto) return false;
      if (filtroActivo === 'Todos') return true;
      return kit.tags.includes(filtroActivo) || kit.categoria === filtroActivo;
    });
  }, [kitsBase, busqueda, filtroActivo]);

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

  const cleanWa = negocio.whatsapp.replace(/\D/g, '');
  const intlWa = cleanWa.startsWith('595')
    ? cleanWa
    : cleanWa.startsWith('0')
    ? `595${cleanWa.slice(1)}`
    : `595${cleanWa}`;

  return (
    <main className="px-4 pt-4 pb-10 space-y-5">
      {/* Header personalizado del Negocio Suscriptor */}
      <header
        className="rounded-3xl p-5 text-white shadow-soft space-y-3"
        style={{ backgroundColor: negocio.colorPrimario }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 overflow-hidden">
              {negocio.logoUrl ? (
                <img
                  src={negocio.logoUrl}
                  alt={negocio.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <PartyPopper className="w-6 h-6" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full">
                {negocio.estado === 'prueba'
                  ? 'Prueba Gratis'
                  : PLANES_SAAS[negocio.plan].nombre}
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
            href={`https://wa.me/${intlWa}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-2xl bg-white text-gray-900 text-xs font-extrabold flex items-center gap-1.5 shadow shrink-0"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            WhatsApp
          </a>
        </div>

        <div className="text-xs bg-black/15 rounded-2xl px-3.5 py-2 flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Reservá con 50% de seña • Alias:{' '}
            <strong>{negocio.aliasSipap || negocio.whatsapp}</strong>
          </span>
          <span>{kitsBase.length} kits disponibles</span>
        </div>

        {/* Toggle Soy Decoradora si el plan lo incluye (Pro o Marca Blanca) */}
        {negocio.plan !== 'basico' && (
          <button
            type="button"
            onClick={toggleDecoradora}
            className="w-full bg-white/15 hover:bg-white/25 rounded-2xl px-3.5 py-2 flex items-center justify-between text-xs font-bold transition"
          >
            <span className="flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-300" />
              Modo Soy Decoradora (Precios Mayoristas)
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white text-gray-900 text-[10px] font-extrabold">
              {esDecoradora ? 'ACTIVADO' : 'ACTIVAR'}
            </span>
          </button>
        )}
      </header>

      {/* Buscador y Filtros */}
      <section id="catalogo" className="space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder={`Buscar kits en ${negocio.nombre}...`}
            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-pink-100 shadow-sm text-sm font-medium text-gray-800"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {FILTROS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFiltroActivo(cat)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition shrink-0 ${
                filtroActivo === cat
                  ? 'bg-brand-pink text-white shadow'
                  : 'bg-white text-gray-600 border border-pink-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {kitsFiltrados.map((kit) => (
          <KitCard key={kit.id} kit={kit} hrefPrefix={`/tienda/${slug}`} />
        ))}
      </section>
    </main>
  );
}
