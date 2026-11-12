'use client';

import React from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  PackageCheck,
  RotateCcw,
  Wallet,
  Clock,
  Box,
  ListChecks,
  Wrench,
  Store,
  Landmark,
} from 'lucide-react';
import {
  formatGuaranies,
  PRECIOS_ROTURA,
  DEFAULT_NEGOCIO_ID,
} from '@/lib/kits';
import { useApp } from '@/lib/store';
import AdminReservasManager from '@/components/AdminReservasManager';

export default function AdminDashboardPage() {
  const { reservas, kits, negocios } = useApp();
  const tiendaLocal = negocios.find((n) => n.id === DEFAULT_NEGOCIO_ID);

  const hoyStr = new Date().toISOString().split('T')[0];

  // Métricas de las 5 Cards del Dashboard
  const reservasHoy = reservas.filter(
    (r) => r.creadoEn === hoyStr || r.fechaRetiro === hoyStr
  ).length;
  const retirosPendientesHoy = reservas.filter(
    (r) => r.fechaRetiro === hoyStr || r.estado === 'Pagó 50%'
  ).length;
  const devolucionesPendientes = reservas.filter(
    (r) => r.estado === 'Retirado'
  ).length;

  const totalCobrado = reservas.reduce((acc, r) => {
    if (r.estado === 'Pendiente') return acc;
    if (r.estado === 'Pagó 50%') return acc + r.sena50;
    return acc + r.precioTotal;
  }, 0);

  const totalPendiente = reservas.reduce((acc, r) => {
    if (r.estado === 'Pendiente') return acc + r.precioTotal;
    if (r.estado === 'Pagó 50%') return acc + r.saldoPendiente;
    return acc;
  }, 0);

  return (
    <main className="px-4 pt-4 pb-12 space-y-5 print:p-0">
      {/* Header Admin */}
      <header className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-pink">
            Sistema de Gestión CDE
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            Panel Admin • {tiendaLocal?.nombre || 'Pegue y Monte'}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/tienda"
            className="px-3.5 py-2 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-extrabold flex items-center gap-1.5 hover:bg-amber-100 transition"
          >
            <Store className="w-4 h-4 text-brand-gold" />
            Mi Tienda (Logo y Portada)
          </Link>
          <Link
            href="/admin/kits"
            className="px-3.5 py-2 rounded-2xl bg-pink-50 text-brand-pink text-xs font-extrabold flex items-center gap-1.5 hover:bg-brand-pink hover:text-white transition"
          >
            <Box className="w-4 h-4" />
            Gestionar Kits
          </Link>
          <Link
            href="/admin/reservas"
            className="px-3.5 py-2 rounded-2xl bg-teal-50 text-brand-teal text-xs font-extrabold flex items-center gap-1.5 hover:bg-brand-teal hover:text-white transition"
          >
            <ListChecks className="w-4 h-4" />
            Agenda Reservas
          </Link>
          <Link
            href="/admin/tesoreria"
            className="px-3.5 py-2 rounded-2xl bg-gray-900 text-white text-xs font-extrabold flex items-center gap-1.5 hover:bg-gray-800 transition shadow-sm"
          >
            <Landmark className="w-4 h-4 text-amber-300" />
            Tesorería y Resultados
          </Link>
        </div>
      </header>

      {/* 5 Cards del Dashboard */}
      <section className="grid grid-cols-2 sm:grid-cols-5 gap-3 no-print">
        <div className="bg-white rounded-3xl p-3.5 shadow-card border border-pink-100">
          <div className="flex items-center justify-between text-brand-pink mb-1">
            <span className="text-[11px] font-bold text-gray-500">Reservas hoy</span>
            <CalendarCheck className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{reservasHoy}</p>
        </div>

        <div className="bg-white rounded-3xl p-3.5 shadow-card border border-amber-100">
          <div className="flex items-center justify-between text-brand-gold mb-1">
            <span className="text-[11px] font-bold text-gray-500">Retiros</span>
            <PackageCheck className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900">
            {retirosPendientesHoy}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-3.5 shadow-card border border-teal-100">
          <div className="flex items-center justify-between text-brand-teal mb-1">
            <span className="text-[11px] font-bold text-gray-500">Devoluciones</span>
            <RotateCcw className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900">
            {devolucionesPendientes}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-3.5 shadow-card border border-emerald-100">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[11px] font-bold text-gray-500">Cobrado</span>
            <Wallet className="w-4 h-4" />
          </div>
          <p className="text-sm sm:text-base font-extrabold text-emerald-700">
            {formatGuaranies(totalCobrado)}
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white rounded-3xl p-3.5 shadow-card border border-rose-100">
          <div className="flex items-center justify-between text-rose-500 mb-1">
            <span className="text-[11px] font-bold text-gray-500">Pendiente</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-sm sm:text-base font-extrabold text-rose-600">
            {formatGuaranies(totalPendiente)}
          </p>
        </div>
      </section>

      {/* Referencia rápida Tarifario de Garantía por Rotura */}
      <section className="bg-white rounded-3xl p-4 shadow-card border border-amber-200/80 space-y-2 no-print">
        <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900">
          <Wrench className="w-4 h-4 text-brand-gold" />
          <span>Tarifario Automático de Descuento de Garantía por Rotura:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRECIOS_ROTURA.map((item) => (
            <span
              key={item.id}
              className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-bold text-gray-800"
            >
              {item.nombre}:{' '}
              <strong className="text-brand-pink">
                {formatGuaranies(item.precio)}
              </strong>
            </span>
          ))}
        </div>
      </section>

      {/* Gestor completo de Reservas, Fechas Desde/Hasta, Reportes PDF/CSV y Edición */}
      <AdminReservasManager
        reservas={reservas}
        kits={kits}
        negocioNombre={tiendaLocal?.nombre || 'Pegue y Monte CDE'}
      />
    </main>
  );
}
