'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  PackageCheck,
  RotateCcw,
  Wallet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Box,
  ListChecks,
  Wrench,
  FileImage,
  X,
} from 'lucide-react';
import {
  formatGuaranies,
  PRECIOS_ROTURA,
  EstadoReserva,
  Reserva,
} from '@/lib/kits';
import { useApp } from '@/lib/store';

export default function AdminDashboardPage() {
  const {
    reservas,
    actualizarEstadoReserva,
    registrarDevolucion,
  } = useApp();

  const [modalRotoReserva, setModalRotoReserva] = useState<Reserva | null>(null);
  const [itemsSeleccionados, setItemsSeleccionados] = useState<string[]>([]);
  const [comprobantePreview, setComprobantePreview] = useState<Reserva | null>(null);

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

  const toggleItemRoto = (id: string) => {
    setItemsSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const totalDescuentoRoto = itemsSeleccionados.reduce((acc, id) => {
    const item = PRECIOS_ROTURA.find((p) => p.id === id);
    return acc + (item ? item.precio : 0);
  }, 0);

  const confirmarDevolucionRota = () => {
    if (!modalRotoReserva) return;
    registrarDevolucion(modalRotoReserva.id, 'Roto', itemsSeleccionados);
    setModalRotoReserva(null);
    setItemsSeleccionados([]);
  };

  return (
    <main className="px-4 pt-4 pb-12 space-y-5">
      {/* Header Admin */}
      <header className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-pink">
            Sistema de Gestión CDE
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            Panel Admin • Pegue y Monte
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/kits"
            className="px-3.5 py-2 rounded-2xl bg-pink-50 text-brand-pink text-xs font-extrabold flex items-center gap-1.5 hover:bg-brand-pink hover:text-white transition"
          >
            <Box className="w-4 h-4" />
            Gestionar 38 Kits
          </Link>
          <Link
            href="/admin/reservas"
            className="px-3.5 py-2 rounded-2xl bg-teal-50 text-brand-teal text-xs font-extrabold flex items-center gap-1.5 hover:bg-brand-teal hover:text-white transition"
          >
            <ListChecks className="w-4 h-4" />
            Agenda Reservas
          </Link>
        </div>
      </header>

      {/* 5 Cards del Dashboard */}
      <section className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
      <section className="bg-white rounded-3xl p-4 shadow-card border border-amber-200/80 space-y-2">
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

      {/* Tabla de Reservas y Control de Devolución */}
      <section className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-pink-100 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-gray-900 text-base">
            Reservas Activas e Historial ({reservas.length})
          </h2>
          <span className="text-xs text-gray-500">
            Bloqueo automático de fechas en calendario
          </span>
        </div>

        <div className="space-y-3">
          {reservas.map((r) => {
            const badgeColor =
              r.estado === 'Pendiente'
                ? 'bg-amber-100 text-amber-800'
                : r.estado === 'Pagó 50%'
                ? 'bg-blue-100 text-blue-800'
                : r.estado === 'Retirado'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-emerald-100 text-emerald-800';

            return (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-brand-bg border border-pink-100 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-brand-pink">
                        {r.id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${badgeColor}`}
                      >
                        {r.estado}
                      </span>
                      {r.esDecoradora && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                          DECORADORA
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-gray-900 text-base mt-0.5">
                      {r.kitNombre}
                    </h3>
                    <p className="text-xs text-gray-600">
                      Cliente: <strong>{r.clienteNombre}</strong> (CI: {r.clienteCi}) • WhatsApp: {r.clienteWhatsapp}
                    </p>
                    <p className="text-xs text-gray-500">
                      Fechas: <strong>{r.fechaRetiro}</strong> al{' '}
                      <strong>{r.fechaDevolucion}</strong> •{' '}
                      {r.modalidadEntrega === 'delivery'
                        ? 'Delivery CDE'
                        : 'Retiro Local'}
                    </p>
                  </div>

                  <div className="text-right text-xs space-y-0.5">
                    <p className="text-gray-500">
                      Total:{' '}
                      <strong className="text-gray-900 text-sm">
                        {formatGuaranies(r.precioTotal)}
                      </strong>
                    </p>
                    <p className="text-emerald-700 font-bold">
                      Seña 50%: {formatGuaranies(r.sena50)}
                    </p>
                    <p className="text-teal-800 font-semibold">
                      Garantía: {formatGuaranies(r.garantia)}
                    </p>
                    {r.comprobanteUrl ? (
                      <button
                        type="button"
                        onClick={() => setComprobantePreview(r)}
                        className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[11px] hover:bg-blue-100"
                      >
                        <FileImage className="w-3.5 h-3.5" />
                        Ver Comprobante
                      </button>
                    ) : r.comprobanteNombre ? (
                      <span className="block text-[10px] text-gray-500 mt-1">
                        Archivo: {r.comprobanteNombre}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Controles de Estado y Botones de Devolución */}
                <div className="pt-2 border-t border-pink-200/50 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-gray-500 mr-1">
                      Estado:
                    </span>
                    {(
                      ['Pendiente', 'Pagó 50%', 'Retirado', 'Devuelto'] as EstadoReserva[]
                    ).map((est) => (
                      <button
                        key={est}
                        type="button"
                        onClick={() => actualizarEstadoReserva(r.id, est)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${
                          r.estado === est
                            ? 'bg-gray-900 text-white'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {est}
                      </button>
                    ))}
                  </div>

                  {/* Botones de Devolución: OK / Roto / Sucio */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-500">
                      Devolución:
                    </span>
                    <button
                      type="button"
                      onClick={() => registrarDevolucion(r.id, 'OK', [])}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition ${
                        r.estadoDevolucion === 'OK'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      OK
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setModalRotoReserva(r);
                        setItemsSeleccionados(r.itemsRotos || []);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition ${
                        r.estadoDevolucion === 'Roto'
                          ? 'bg-rose-600 text-white shadow'
                          : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Roto
                    </button>

                    <button
                      type="button"
                      onClick={() => registrarDevolucion(r.id, 'Sucio', [])}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition ${
                        r.estadoDevolucion === 'Sucio'
                          ? 'bg-amber-600 text-white shadow'
                          : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Sucio
                    </button>
                  </div>
                </div>

                {/* Resultado de Liquidación de Garantía si ya fue devuelto */}
                {r.estado === 'Devuelto' && r.estadoDevolucion && (
                  <div
                    className={`p-3 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 ${
                      r.estadoDevolucion === 'OK'
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : 'bg-rose-50 text-rose-900 border border-rose-200'
                    }`}
                  >
                    <div>
                      <strong>Inspección Final: {r.estadoDevolucion}</strong>
                      {r.itemsRotos && r.itemsRotos.length > 0 && (
                        <span className="ml-2">
                          (Piezas dañadas:{' '}
                          {r.itemsRotos
                            .map(
                              (id) =>
                                PRECIOS_ROTURA.find((p) => p.id === id)?.nombre
                            )
                            .join(', ')}
                          )
                        </span>
                      )}
                    </div>
                    <div className="font-extrabold">
                      Descuento aplicado: {formatGuaranies(r.descuentoGarantia || 0)} •{' '}
                      Garantía devuelta al cliente:{' '}
                      {formatGuaranies(r.garantiaDevuelta ?? r.garantia)}
                      {(r.descuentoGarantia || 0) > r.garantia && (
                        <span className="text-rose-700 ml-2">
                          (Saldo adicional a cobrar por daño:{' '}
                          {formatGuaranies((r.descuentoGarantia || 0) - r.garantia)})
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal de Cálculo Automático de Garantía por Rotura */}
      {modalRotoReserva && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div>
              <span className="text-xs font-extrabold text-rose-600 uppercase">
                Descuento Automático de Garantía
              </span>
              <h3 className="text-lg font-extrabold text-gray-900">
                Reportar Piezas Rotas • {modalRotoReserva.kitNombre}
              </h3>
              <p className="text-xs text-gray-500">
                Cliente: {modalRotoReserva.clienteNombre} • Garantía depositada:{' '}
                <strong>{formatGuaranies(modalRotoReserva.garantia)}</strong>
              </p>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {PRECIOS_ROTURA.map((item) => {
                const checked = itemsSeleccionados.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${
                      checked
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleItemRoto(item.id)}
                        className="w-4 h-4 accent-rose-600"
                      />
                      <span className="text-sm font-bold text-gray-900">
                        {item.nombre}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-rose-600">
                      - {formatGuaranies(item.precio)}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="p-3.5 rounded-2xl bg-brand-bg border border-pink-100 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Garantía del Cliente:</span>
                <strong>{formatGuaranies(modalRotoReserva.garantia)}</strong>
              </div>
              <div className="flex justify-between text-rose-600 font-bold">
                <span>Total Descuento por Roturas:</span>
                <span>- {formatGuaranies(totalDescuentoRoto)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-gray-200 font-extrabold text-sm">
                <span>Garantía a Devolver:</span>
                <span className="text-brand-teal">
                  {formatGuaranies(
                    Math.max(0, modalRotoReserva.garantia - totalDescuentoRoto)
                  )}
                </span>
              </div>
              {totalDescuentoRoto > modalRotoReserva.garantia && (
                <div className="flex justify-between text-rose-700 font-extrabold pt-1">
                  <span>Diferencia a abonar por el cliente:</span>
                  <span>
                    {formatGuaranies(
                      totalDescuentoRoto - modalRotoReserva.garantia
                    )}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setModalRotoReserva(null)}
                className="py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarDevolucionRota}
                className="py-3 rounded-2xl bg-rose-600 text-white font-extrabold text-xs shadow"
              >
                Aplicar Descuento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Vista Previa Comprobante de Transferencia */}
      {comprobantePreview && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">
                  Comprobante • {comprobantePreview.id}
                </h3>
                <p className="text-xs text-gray-500">
                  {comprobantePreview.clienteNombre} • Seña:{' '}
                  {formatGuaranies(comprobantePreview.sena50)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setComprobantePreview(null)}
                className="p-1.5 rounded-xl bg-gray-100 text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {comprobantePreview.comprobanteUrl?.startsWith('data:application/pdf') ||
            comprobantePreview.comprobanteUrl?.endsWith('.pdf') ? (
              <div className="p-5 bg-brand-bg rounded-2xl text-center space-y-2">
                <p className="text-xs font-bold text-gray-700">
                  Comprobante en PDF: {comprobantePreview.comprobanteNombre}
                </p>
                <a
                  href={comprobantePreview.comprobanteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block px-4 py-2 rounded-xl bg-brand-pink text-white text-xs font-extrabold"
                >
                  Abrir PDF
                </a>
              </div>
            ) : (
              <img
                src={comprobantePreview.comprobanteUrl}
                alt="Comprobante de transferencia"
                className="w-full max-h-96 object-contain rounded-2xl bg-gray-100 border border-gray-200"
              />
            )}

            <button
              type="button"
              onClick={() => setComprobantePreview(null)}
              className="w-full py-3 rounded-2xl bg-gray-900 text-white font-bold text-xs"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
