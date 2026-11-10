'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  MapPin,
  PartyPopper,
  ShieldCheck,
  SlidersHorizontal,
  Volume2,
  Crown,
} from 'lucide-react';
import { CategoriaFiltro, formatGuaranies } from '@/lib/kits';
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

export default function HomePage() {
  const { kits, esDecoradora, toggleDecoradora } = useApp();
  const [busqueda, setBusqueda] = useState('');
  const [filtroActivo, setFiltroActivo] = useState<CategoriaFiltro>('Todos');

  const kitsFiltrados = useMemo(() => {
    return kits.filter((kit) => {
      const coincideTexto =
        kit.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        kit.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
        kit.descripcion.toLowerCase().includes(busqueda.toLowerCase());

      if (!coincideTexto) return false;
      if (filtroActivo === 'Todos') return true;
      return kit.tags.includes(filtroActivo) || kit.categoria === filtroActivo;
    });
  }, [kits, busqueda, filtroActivo]);

  const ahorroPromedio = 250000;

  return (
    <main className="px-4 pt-4 pb-8 space-y-5">
      {/* Header Principal */}
      <header className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-pink-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-pink to-brand-gold flex items-center justify-center text-white shadow-md">
              <PartyPopper className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight leading-none">
                Pegue y Monte <span className="text-brand-pink">CDE</span>
              </h1>
              <p className="text-xs font-medium text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-brand-teal" />
                Ciudad del Este - Paraguay
              </p>
            </div>
          </div>

          <Link
            href="/admin"
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
          >
            Panel Admin
          </Link>
        </div>

        {/* Banner / Toggle Soy Decoradora */}
        <div
          onClick={toggleDecoradora}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && toggleDecoradora()}
          className={`cursor-pointer rounded-2xl p-3 transition-all border flex items-center justify-between ${
            esDecoradora
              ? 'bg-gradient-to-r from-amber-500 to-brand-gold text-white border-amber-400 shadow-md'
              : 'bg-brand-bg border-amber-200/80 text-gray-800 hover:border-brand-gold'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                esDecoradora ? 'bg-white/20 text-white' : 'bg-amber-100 text-brand-gold'
              }`}
            >
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-extrabold flex items-center gap-1.5">
                Soy Decoradora / Socia PRO
                {esDecoradora && (
                  <span className="text-[10px] bg-white text-amber-700 px-2 py-0.5 rounded-full font-extrabold">
                    ACTIVO
                  </span>
                )}
              </p>
              <p
                className={`text-[11px] ${
                  esDecoradora ? 'text-amber-50 font-medium' : 'text-gray-500'
                }`}
              >
                {esDecoradora
                  ? `¡Precios mayoristas activados! Ahorrás hasta ${formatGuaranies(550000)} por kit`
                  : `Activá para ver precios mayoristas (Ahorrás prom. ${formatGuaranies(ahorroPromedio)} con membresía)`}
              </p>
            </div>
          </div>

          {/* Switch Visual */}
          <div
            className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors shrink-0 ${
              esDecoradora ? 'bg-white/30' : 'bg-gray-300'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                esDecoradora ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </div>
      </header>

      {/* Hero Promo Express */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-pink via-rose-500 to-brand-gold p-5 text-white shadow-soft">
        <div className="relative z-10 max-w-lg space-y-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" /> Armalo vos misma en 15 minutos
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold leading-tight">
            Tu fiesta soñada en CDE a mitad de precio
          </h2>
          <p className="text-xs sm:text-sm text-pink-50">
            Elegí tu kit de decoración o sonido, reservá tu fecha con el{' '}
            <strong>50% de seña</strong> y retiralo en cualquier auto.
          </p>
          <div className="pt-1 flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="bg-white/20 px-2.5 py-1 rounded-xl flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 38 Kits Listos
            </span>
            <span className="bg-white/20 px-2.5 py-1 rounded-xl flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5" /> Sonido, Luces y Pantallas LED
            </span>
          </div>
        </div>
      </section>

      {/* Buscador y Filtros */}
      <section id="catalogo" className="space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar kit: Stitch, Safari, 15 Dorado, Sonido, LED..."
            className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl border border-pink-100 shadow-sm text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-pink"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600 px-2 py-1"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Chips de Categorías */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <div className="flex items-center gap-1 text-xs font-bold text-gray-400 pr-1 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          {FILTROS.map((cat) => {
            const activo = filtroActivo === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFiltroActivo(cat)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  activo
                    ? 'bg-brand-pink text-white shadow-md scale-105'
                    : 'bg-white text-gray-600 border border-pink-100 hover:border-brand-pink/50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Contador de resultados */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-extrabold text-gray-800">
          {filtroActivo === 'Todos' ? 'Todos los Kits' : `Categoría: ${filtroActivo}`}{' '}
          <span className="text-brand-pink">({kitsFiltrados.length})</span>
        </h2>
        <span className="text-xs text-gray-500 font-medium">
          Precios en Guaraníes (Gs.)
        </span>
      </div>

      {/* Grid de Kits */}
      {kitsFiltrados.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-pink-100 space-y-3">
          <p className="text-base font-bold text-gray-700">
            No encontramos kits con "{busqueda}"
          </p>
          <button
            type="button"
            onClick={() => {
              setBusqueda('');
              setFiltroActivo('Todos');
            }}
            className="px-4 py-2 rounded-2xl bg-brand-pink text-white text-xs font-bold"
          >
            Ver los 38 kits disponibles
          </button>
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {kitsFiltrados.map((kit) => (
            <KitCard key={kit.id} kit={kit} />
          ))}
        </section>
      )}
    </main>
  );
}
