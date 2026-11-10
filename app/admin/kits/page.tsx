'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, Search } from 'lucide-react';
import { formatGuaranies } from '@/lib/kits';
import { useApp } from '@/lib/store';

export default function AdminKitsPage() {
  const { kits, toggleDisponibilidadKit } = useApp();
  const [busqueda, setBusqueda] = useState('');

  const kitsFiltrados = kits.filter(
    (k) =>
      k.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      k.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <main className="px-4 pt-4 pb-12 space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white shadow-sm border border-pink-100 text-sm font-bold text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Admin
        </Link>
        <span className="text-xs font-extrabold text-brand-pink bg-pink-50 px-3 py-1.5 rounded-xl">
          38 Kits Cargados
        </span>
      </div>

      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-pink-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900">
              Inventario de los 38 Kits
            </h1>
            <p className="text-xs text-gray-500">
              Activá o pausá kits para mantenimiento o limpieza en CDE
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar kit..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-brand-bg border border-pink-100 text-xs font-medium"
            />
          </div>
        </div>

        <div className="space-y-2.5">
          {kitsFiltrados.map((k) => (
            <div
              key={k.id}
              className="p-3 rounded-2xl bg-brand-bg border border-pink-100 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={k.fotos[0]}
                  alt={k.nombre}
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-brand-pink uppercase">
                    #{k.id} • {k.categoria}
                  </span>
                  <h3 className="font-extrabold text-gray-900 text-sm truncate">
                    {k.nombre}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Público: <strong>{formatGuaranies(k.precioPublico)}</strong> •
                    Decoradora:{' '}
                    <strong className="text-amber-700">
                      {formatGuaranies(k.precioDecoradora)}
                    </strong>{' '}
                    • Garantía: {formatGuaranies(k.garantia)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleDisponibilidadKit(k.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 shrink-0 transition ${
                  k.disponible
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                }`}
              >
                {k.disponible ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Disponible
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" /> En Mantenimiento
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
