'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Phone, Calendar, ShieldAlert } from 'lucide-react';
import { formatGuaranies, EstadoReserva } from '@/lib/kits';
import { useApp } from '@/lib/store';

export default function AdminReservasPage() {
  const { reservas, actualizarEstadoReserva } = useApp();
  const [filtroEstado, setFiltroEstado] = useState<string>('Todos');

  const filtradas =
    filtroEstado === 'Todos'
      ? reservas
      : reservas.filter((r) => r.estado === filtroEstado);

  return (
    <main className="px-4 pt-4 pb-12 space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white shadow-sm border border-pink-100 text-sm font-bold text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Dashboard
        </Link>
        <span className="text-xs font-extrabold text-brand-teal bg-teal-50 px-3 py-1.5 rounded-xl">
          Control Anti Doble-Reserva Activo
        </span>
      </div>

      <section className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-pink-100 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-lg sm:text-xl font-extrabold text-gray-900">
            Agenda Completa de Reservas
          </h1>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {['Todos', 'Pendiente', 'Pagó 50%', 'Retirado', 'Devuelto'].map(
              (est) => (
                <button
                  key={est}
                  type="button"
                  onClick={() => setFiltroEstado(est)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    filtroEstado === est
                      ? 'bg-brand-pink text-white'
                      : 'bg-brand-bg text-gray-600'
                  }`}
                >
                  {est}
                </button>
              )
            )}
          </div>
        </div>

        <div className="space-y-3">
          {filtradas.map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-2xl bg-brand-bg border border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-brand-pink">
                    {r.id}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-gray-200">
                    {r.estado}
                  </span>
                </div>
                <h3 className="font-extrabold text-gray-900 text-base">
                  {r.kitNombre}
                </h3>
                <p className="text-xs text-gray-600">
                  {r.clienteNombre} • CI: {r.clienteCi} • {r.direccionFiesta}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-teal" />
                    {r.fechaRetiro} → {r.fechaDevolucion}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-brand-pink" />
                    {r.clienteWhatsapp}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-2">
                <div className="text-xs sm:text-right">
                  <span className="block font-extrabold text-gray-900 text-sm">
                    Total: {formatGuaranies(r.precioTotal)}
                  </span>
                  <span className="text-emerald-700 font-semibold">
                    Seña: {formatGuaranies(r.sena50)} | Garantía:{' '}
                    {formatGuaranies(r.garantia)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {(
                    ['Pendiente', 'Pagó 50%', 'Retirado', 'Devuelto'] as EstadoReserva[]
                  ).map((est) => (
                    <button
                      key={est}
                      type="button"
                      onClick={() => actualizarEstadoReserva(r.id, est)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                        r.estado === est
                          ? 'bg-gray-900 text-white'
                          : 'bg-white text-gray-600 border border-gray-200'
                      }`}
                    >
                      {est}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {filtradas.length === 0 && (
            <div className="p-6 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-gray-400" />
              No hay reservas en estado "{filtroEstado}".
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
