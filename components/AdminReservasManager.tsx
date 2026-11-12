'use client';

import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  FileImage,
  X,
  Pencil,
  Trash2,
  Download,
  FileText,
  Calendar,
  Search,
  Printer,
  Calculator,
} from 'lucide-react';
import {
  Kit,
  Reserva,
  EstadoReserva,
  PRECIOS_ROTURA,
  COSTO_DELIVERY_CDE,
  COSTO_UPSELL_SONIDO_CASA,
  formatGuaranies,
} from '@/lib/kits';
import { useApp } from '@/lib/store';

interface AdminReservasManagerProps {
  reservas: Reserva[];
  kits: Kit[];
  negocioNombre?: string;
}

const calcularCobradoReserva = (r: Reserva): number => {
  if (r.estado === 'Pendiente') return 0;
  if (r.estado === 'Pagó 50%') return r.sena50;
  return r.precioTotal;
};

const calcularPendienteReserva = (r: Reserva): number => {
  if (r.estado === 'Pendiente') return r.precioTotal;
  if (r.estado === 'Pagó 50%') return r.saldoPendiente;
  return 0;
};

export default function AdminReservasManager({
  reservas,
  kits,
  negocioNombre = 'Pegue y Monte CDE',
}: AdminReservasManagerProps) {
  const {
    actualizarEstadoReserva,
    registrarDevolucion,
    editarReserva,
    eliminarReserva,
  } = useApp();

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'Todos' | EstadoReserva>('Todos');
  const [tipoFecha, setTipoFecha] = useState<'retiro' | 'creacion'>('retiro');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Modales
  const [modalRotoReserva, setModalRotoReserva] = useState<Reserva | null>(null);
  const [itemsSeleccionados, setItemsSeleccionados] = useState<string[]>([]);
  const [comprobantePreview, setComprobantePreview] = useState<Reserva | null>(
    null
  );
  const [reservaAEditar, setReservaAEditar] = useState<Reserva | null>(null);
  const [reservaABorrar, setReservaABorrar] = useState<Reserva | null>(null);
  const [verReportePDF, setVerReportePDF] = useState(false);

  const hoyStr = new Date().toISOString().split('T')[0];

  const aplicarRangoRapido = (rango: 'hoy' | 'semana' | 'mes' | 'todas') => {
    if (rango === 'todas') {
      setFechaDesde('');
      setFechaHasta('');
      return;
    }
    const hoy = new Date();
    if (rango === 'hoy') {
      const f = hoy.toISOString().split('T')[0];
      setFechaDesde(f);
      setFechaHasta(f);
      return;
    }
    if (rango === 'semana') {
      const inicio = new Date(hoy);
      inicio.setDate(hoy.getDate() - hoy.getDay());
      const fin = new Date(inicio);
      fin.setDate(inicio.getDate() + 6);
      setFechaDesde(inicio.toISOString().split('T')[0]);
      setFechaHasta(fin.toISOString().split('T')[0]);
      return;
    }
    // mes
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    setFechaDesde(inicioMes.toISOString().split('T')[0]);
    setFechaHasta(finMes.toISOString().split('T')[0]);
  };

  const reservasFiltradas = useMemo(() => {
    return reservas.filter((r) => {
      if (filtroEstado !== 'Todos' && r.estado !== filtroEstado) return false;

      if (busqueda.trim()) {
        const q = busqueda.toLowerCase();
        const match =
          r.id.toLowerCase().includes(q) ||
          r.kitNombre.toLowerCase().includes(q) ||
          r.clienteNombre.toLowerCase().includes(q) ||
          r.clienteCi.toLowerCase().includes(q) ||
          r.clienteWhatsapp.toLowerCase().includes(q);
        if (!match) return false;
      }

      const fechaTarget = tipoFecha === 'retiro' ? r.fechaRetiro : r.creadoEn;
      if (fechaDesde && fechaTarget < fechaDesde) return false;
      if (fechaHasta && fechaTarget > fechaHasta) return false;

      return true;
    });
  }, [reservas, filtroEstado, busqueda, tipoFecha, fechaDesde, fechaHasta]);

  // Totales del reporte filtrado
  const resumenReporte = useMemo(() => {
    const totalFacturado = reservasFiltradas.reduce(
      (acc, r) => acc + r.precioTotal,
      0
    );
    const totalCobrado = reservasFiltradas.reduce(
      (acc, r) => acc + calcularCobradoReserva(r),
      0
    );
    const totalPendiente = reservasFiltradas.reduce(
      (acc, r) => acc + calcularPendienteReserva(r),
      0
    );
    const totalDescuentos = reservasFiltradas.reduce(
      (acc, r) => acc + (r.descuentoGarantia || 0),
      0
    );
    const porMetodo = {
      transferencia: reservasFiltradas
        .filter((r) => r.metodoPago === 'transferencia')
        .reduce((acc, r) => acc + calcularCobradoReserva(r), 0),
      bancard: reservasFiltradas
        .filter((r) => r.metodoPago === 'bancard')
        .reduce((acc, r) => acc + calcularCobradoReserva(r), 0),
      pix: reservasFiltradas
        .filter((r) => r.metodoPago === 'pix')
        .reduce((acc, r) => acc + calcularCobradoReserva(r), 0),
    };
    return {
      totalFacturado,
      totalCobrado,
      totalPendiente,
      totalDescuentos,
      porMetodo,
    };
  }, [reservasFiltradas]);

  const handleExportarCSV = () => {
    const headers = [
      'Código',
      'Fecha Creación',
      'Fecha Retiro',
      'Fecha Devolución',
      'Kit',
      'Cliente',
      'CI',
      'WhatsApp',
      'Dirección',
      'Modalidad',
      'Método Pago',
      'Estado',
      'Total (Gs)',
      'Cobrado (Gs)',
      'Pendiente (Gs)',
      'Garantía (Gs)',
      'Inspección',
      'Descuento Garantía (Gs)',
      'Requiere Factura',
      'Razón Social Factura',
      'RUC Factura',
      'Email Factura',
    ];

    const escapeCsv = (val: string | number | undefined) => {
      const s = String(val ?? '').replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = reservasFiltradas.map((r) => [
      r.id,
      r.creadoEn,
      r.fechaRetiro,
      r.fechaDevolucion,
      r.kitNombre,
      r.clienteNombre,
      r.clienteCi,
      r.clienteWhatsapp,
      r.direccionFiesta,
      r.modalidadEntrega === 'delivery' ? 'Delivery' : 'Retiro Local',
      r.metodoPago.toUpperCase(),
      r.estado,
      r.precioTotal,
      calcularCobradoReserva(r),
      calcularPendienteReserva(r),
      r.garantia,
      r.estadoDevolucion || '-',
      r.descuentoGarantia || 0,
      r.requiereFactura ? 'Sí' : 'No',
      r.facturacionRazonSocial || '',
      r.facturacionRuc || '',
      r.facturacionEmail || '',
    ]);

    rows.push([
      'TOTALES',
      '',
      fechaDesde || 'Inicio',
      fechaHasta || 'Fin',
      `${reservasFiltradas.length} reservas`,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      resumenReporte.totalFacturado,
      resumenReporte.totalCobrado,
      resumenReporte.totalPendiente,
      '',
      '',
      resumenReporte.totalDescuentos,
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.map(escapeCsv).join(';'), ...rows.map((row) => row.map(escapeCsv).join(';'))].join(
        '\r\n'
      );

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-reservas-${fechaDesde || 'todas'}-${fechaHasta || hoyStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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

  const handleRecalcularMontosEdicion = () => {
    if (!reservaAEditar) return;
    const kitElegido = kits.find((k) => k.id === reservaAEditar.kitId) || kits[0];
    const base = kitElegido
      ? reservaAEditar.esDecoradora
        ? kitElegido.precioDecoradora
        : kitElegido.precioPublico
      : reservaAEditar.precioTotal;
    const upsell = reservaAEditar.agregaSonidoCasa ? COSTO_UPSELL_SONIDO_CASA : 0;
    const delivery =
      reservaAEditar.modalidadEntrega === 'delivery' ? COSTO_DELIVERY_CDE : 0;
    const total = base + upsell + delivery;
    const sena = Math.round(total * 0.5);
    const saldo =
      reservaAEditar.estado === 'Retirado' || reservaAEditar.estado === 'Devuelto'
        ? 0
        : total - sena;

    setReservaAEditar({
      ...reservaAEditar,
      kitNombre: kitElegido?.nombre || reservaAEditar.kitNombre,
      costoUpsell: upsell,
      costoDelivery: delivery,
      precioTotal: total,
      sena50: sena,
      saldoPendiente: saldo,
      garantia: kitElegido?.garantia ?? reservaAEditar.garantia,
    });
  };

  const handleGuardarEdicion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservaAEditar) return;
    editarReserva(reservaAEditar);
    setReservaAEditar(null);
  };

  return (
    <section className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-pink-100 space-y-4 print:bg-transparent print:shadow-none print:border-0 print:p-0">
      <div className={`space-y-4 ${verReportePDF ? 'no-print' : ''}`}>
      {/* Título + Botones de Reporte */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-extrabold text-gray-900 text-base sm:text-lg">
            Reservas Activas, Historial y Reportes ({reservasFiltradas.length})
          </h2>
          <p className="text-xs text-gray-500">
            Filtrá por fechas Desde / Hasta, exportá reportes o editá cualquier reserva.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportarCSV}
            className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            Exportar Excel (CSV)
          </button>
          <button
            type="button"
            onClick={() => setVerReportePDF(true)}
            className="px-3.5 py-2 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition"
          >
            <FileText className="w-4 h-4 text-amber-300" />
            Reporte PDF Profesional
          </button>
        </div>
      </div>

      {/* Filtros por Fecha (Desde / Hasta) + Buscador + Estado */}
      <div className="p-3.5 rounded-2xl bg-brand-bg border border-pink-100 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
          <div>
            <label className="block font-bold text-gray-600 mb-1">
              Filtrar fecha por:
            </label>
            <select
              value={tipoFecha}
              onChange={(e) => setTipoFecha(e.target.value as 'retiro' | 'creacion')}
              className="w-full px-3 py-2 rounded-xl bg-white border border-pink-100 font-bold text-gray-800"
            >
              <option value="retiro">Fecha de Retiro</option>
              <option value="creacion">Fecha de Reserva</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-600 mb-1">Desde:</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-pink-100 font-semibold text-gray-800"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-600 mb-1">Hasta:</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-pink-100 font-semibold text-gray-800"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-600 mb-1">
              Buscar cliente / kit / código:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Nombre, CI, kit..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-pink-100 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Atajos rápidos de fechas y filtro de estado */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="font-bold text-gray-500 flex items-center gap-1 mr-1">
              <Calendar className="w-3.5 h-3.5 text-brand-pink" />
              Rango rápido:
            </span>
            <button
              type="button"
              onClick={() => aplicarRangoRapido('hoy')}
              className="px-2.5 py-1 rounded-lg bg-white border border-pink-200 font-bold text-gray-700 hover:border-brand-pink"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => aplicarRangoRapido('semana')}
              className="px-2.5 py-1 rounded-lg bg-white border border-pink-200 font-bold text-gray-700 hover:border-brand-pink"
            >
              Esta Semana
            </button>
            <button
              type="button"
              onClick={() => aplicarRangoRapido('mes')}
              className="px-2.5 py-1 rounded-lg bg-white border border-pink-200 font-bold text-gray-700 hover:border-brand-pink"
            >
              Este Mes
            </button>
            {(fechaDesde || fechaHasta) && (
              <button
                type="button"
                onClick={() => aplicarRangoRapido('todas')}
                className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 font-bold text-rose-700"
              >
                Limpiar fechas
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(['Todos', 'Pendiente', 'Pagó 50%', 'Retirado', 'Devuelto'] as const).map(
              (est) => (
                <button
                  key={est}
                  type="button"
                  onClick={() => setFiltroEstado(est)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${
                    filtroEstado === est
                      ? 'bg-brand-pink text-white'
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  {est}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Mini Resumen Financiero del Rango Seleccionado */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-[11px] text-gray-500 block">Facturado período</span>
          <strong className="text-sm text-gray-900">
            {formatGuaranies(resumenReporte.totalFacturado)}
          </strong>
        </div>
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
          <span className="text-[11px] text-emerald-700 block">Cobrado período</span>
          <strong className="text-sm text-emerald-800">
            {formatGuaranies(resumenReporte.totalCobrado)}
          </strong>
        </div>
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
          <span className="text-[11px] text-rose-700 block">Saldo pendiente</span>
          <strong className="text-sm text-rose-800">
            {formatGuaranies(resumenReporte.totalPendiente)}
          </strong>
        </div>
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
          <span className="text-[11px] text-amber-800 block">Desc. roturas/limp.</span>
          <strong className="text-sm text-amber-900">
            {formatGuaranies(resumenReporte.totalDescuentos)}
          </strong>
        </div>
      </div>

      {/* Lista de Reservas */}
      <div className="space-y-3">
        {reservasFiltradas.map((r) => {
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
                  <div className="flex flex-wrap items-center gap-2">
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
                    Cliente: <strong>{r.clienteNombre}</strong> (CI: {r.clienteCi}) •
                    WhatsApp: {r.clienteWhatsapp}
                  </p>
                  <p className="text-xs text-gray-500">
                    Retiro: <strong>{r.fechaRetiro}</strong> → Devolución:{' '}
                    <strong>{r.fechaDevolucion}</strong> •{' '}
                    {r.modalidadEntrega === 'delivery' ? 'Delivery' : 'Retiro Local'} •{' '}
                    {r.metodoPago.toUpperCase()}
                  </p>
                  {r.requiereFactura && (
                    <p className="text-[11px] font-bold text-indigo-700 bg-indigo-50 inline-block px-2 py-0.5 rounded-lg mt-1">
                      Factura: {r.facturacionRazonSocial || r.clienteNombre} • RUC:{' '}
                      {r.facturacionRuc || r.clienteCi}
                      {r.facturacionEmail ? ` • ${r.facturacionEmail}` : ''}
                    </p>
                  )}
                </div>

                <div className="text-right text-xs space-y-1">
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
                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    {r.comprobanteUrl && (
                      <button
                        type="button"
                        onClick={() => setComprobantePreview(r)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[11px] hover:bg-blue-100"
                      >
                        <FileImage className="w-3.5 h-3.5" />
                        Comprobante
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setReservaAEditar({ ...r })}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-pink-200 text-gray-700 hover:text-brand-pink font-bold text-[11px]"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setReservaABorrar(r)}
                      className="p-1.5 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50"
                      title="Borrar reserva"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
                    Descuento aplicado: {formatGuaranies(r.descuentoGarantia || 0)}{' '}
                    • Garantía devuelta:{' '}
                    {formatGuaranies(r.garantiaDevuelta ?? r.garantia)}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {reservasFiltradas.length === 0 && (
          <div className="p-8 text-center text-xs text-gray-500">
            No hay reservas que coincidan con ese rango de fechas o filtro.
          </div>
        )}
      </div>
      </div>

      {/* ================= MODAL EDITAR RESERVA ================= */}
      {reservaAEditar && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl space-y-4 my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[11px] font-extrabold text-brand-pink uppercase">
                  Editar Reserva • {reservaAEditar.id}
                </span>
                <h3 className="text-lg font-extrabold text-gray-900">
                  Modificar Datos y Montos
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReservaAEditar(null)}
                className="p-1.5 rounded-xl bg-gray-100 text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarEdicion} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={reservaAEditar.clienteNombre}
                    onChange={(e) =>
                      setReservaAEditar({
                        ...reservaAEditar,
                        clienteNombre: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-pink-100 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    CI / RUC *
                  </label>
                  <input
                    type="text"
                    required
                    value={reservaAEditar.clienteCi}
                    onChange={(e) =>
                      setReservaAEditar({
                        ...reservaAEditar,
                        clienteCi: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-pink-100 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={reservaAEditar.clienteWhatsapp}
                    onChange={(e) =>
                      setReservaAEditar({
                        ...reservaAEditar,
                        clienteWhatsapp: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-pink-100 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Kit Reservado
                  </label>
                  <select
                    value={reservaAEditar.kitId}
                    onChange={(e) => {
                      const newId = Number(e.target.value);
                      const found = kits.find((k) => k.id === newId);
                      setReservaAEditar({
                        ...reservaAEditar,
                        kitId: newId,
                        kitNombre: found?.nombre || reservaAEditar.kitNombre,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-pink-100 font-bold"
                  >
                    {kits.map((k) => (
                      <option key={k.id} value={k.id}>
                        #{k.id} {k.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Dirección del Evento
                </label>
                <input
                  type="text"
                  value={reservaAEditar.direccionFiesta}
                  onChange={(e) =>
                    setReservaAEditar({
                      ...reservaAEditar,
                      direccionFiesta: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-pink-100 font-medium"
                />
              </div>

              <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                <label className="flex items-center gap-2 font-extrabold text-indigo-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(reservaAEditar.requiereFactura)}
                    onChange={(e) =>
                      setReservaAEditar({
                        ...reservaAEditar,
                        requiereFactura: e.target.checked,
                      })
                    }
                    className="accent-brand-pink"
                  />
                  Requiere Factura Legal (Datos de Facturación)
                </label>
                {reservaAEditar.requiereFactura && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={reservaAEditar.facturacionRazonSocial || ''}
                      onChange={(e) =>
                        setReservaAEditar({
                          ...reservaAEditar,
                          facturacionRazonSocial: e.target.value,
                        })
                      }
                      placeholder="Razón Social"
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-indigo-200 font-medium"
                    />
                    <input
                      type="text"
                      value={reservaAEditar.facturacionRuc || ''}
                      onChange={(e) =>
                        setReservaAEditar({
                          ...reservaAEditar,
                          facturacionRuc: e.target.value,
                        })
                      }
                      placeholder="RUC / CI"
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-indigo-200 font-medium"
                    />
                    <input
                      type="email"
                      value={reservaAEditar.facturacionEmail || ''}
                      onChange={(e) =>
                        setReservaAEditar({
                          ...reservaAEditar,
                          facturacionEmail: e.target.value,
                        })
                      }
                      placeholder="Email Factura"
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-indigo-200 font-medium"
                    />
                    <input
                      type="text"
                      value={reservaAEditar.facturacionDireccion || ''}
                      onChange={(e) =>
                        setReservaAEditar({
                          ...reservaAEditar,
                          facturacionDireccion: e.target.value,
                        })
                      }
                      placeholder="Dirección Fiscal"
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-indigo-200 font-medium"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Fecha Retiro
                  </label>
                  <input
                    type="date"
                    value={reservaAEditar.fechaRetiro}
                    onChange={(e) =>
                      setReservaAEditar({
                        ...reservaAEditar,
                        fechaRetiro: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-2 rounded-xl bg-brand-bg border border-pink-100 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Devolución
                  </label>
                  <input
                    type="date"
                    value={reservaAEditar.fechaDevolucion}
                    onChange={(e) =>
                      setReservaAEditar({
                        ...reservaAEditar,
                        fechaDevolucion: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-2 rounded-xl bg-brand-bg border border-pink-100 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Entrega
                  </label>
                  <select
                    value={reservaAEditar.modalidadEntrega}
                    onChange={(e) =>
                      setReservaAEditar({
                        ...reservaAEditar,
                        modalidadEntrega: e.target.value as 'retiro' | 'delivery',
                      })
                    }
                    className="w-full px-2.5 py-2 rounded-xl bg-brand-bg border border-pink-100 font-bold"
                  >
                    <option value="retiro">Retiro</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={reservaAEditar.estado}
                    onChange={(e) =>
                      setReservaAEditar({
                        ...reservaAEditar,
                        estado: e.target.value as EstadoReserva,
                      })
                    }
                    className="w-full px-2.5 py-2 rounded-xl bg-brand-bg border border-pink-100 font-bold"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Pagó 50%">Pagó 50%</option>
                    <option value="Retirado">Retirado</option>
                    <option value="Devuelto">Devuelto</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-brand-bg border border-pink-100">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reservaAEditar.agregaSonidoCasa}
                      onChange={(e) =>
                        setReservaAEditar({
                          ...reservaAEditar,
                          agregaSonidoCasa: e.target.checked,
                        })
                      }
                      className="accent-brand-teal"
                    />
                    + Sonido Casa
                  </label>
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reservaAEditar.esDecoradora}
                      onChange={(e) =>
                        setReservaAEditar({
                          ...reservaAEditar,
                          esDecoradora: e.target.checked,
                        })
                      }
                      className="accent-brand-gold"
                    />
                    Tarifa Decoradora
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleRecalcularMontosEdicion}
                  className="px-2.5 py-1 rounded-xl bg-white border border-pink-200 text-brand-pink font-extrabold inline-flex items-center gap-1"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  Recalcular Montos
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Total (Gs.)
                  </label>
                  <input
                    type="number"
                    value={reservaAEditar.precioTotal}
                    onChange={(e) =>
                      setReservaAEditar({
                        ...reservaAEditar,
                        precioTotal: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2.5 py-2 rounded-xl bg-brand-bg border border-pink-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Seña 50%
                  </label>
                  <input
                    type="number"
                    value={reservaAEditar.sena50}
                    onChange={(e) =>
                      setReservaAEditar({
                        ...reservaAEditar,
                        sena50: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2.5 py-2 rounded-xl bg-brand-bg border border-pink-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Saldo Pend.
                  </label>
                  <input
                    type="number"
                    value={reservaAEditar.saldoPendiente}
                    onChange={(e) =>
                      setReservaAEditar({
                        ...reservaAEditar,
                        saldoPendiente: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2.5 py-2 rounded-xl bg-brand-bg border border-pink-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Garantía
                  </label>
                  <input
                    type="number"
                    value={reservaAEditar.garantia}
                    onChange={(e) =>
                      setReservaAEditar({
                        ...reservaAEditar,
                        garantia: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2.5 py-2 rounded-xl bg-brand-bg border border-pink-100 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setReservaAEditar(null)}
                  className="py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-3 rounded-2xl bg-brand-pink hover:bg-brand-pinkDark text-white font-extrabold shadow"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL BORRAR RESERVA ================= */}
      {reservaABorrar && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-gray-900">
              ¿Eliminar reserva {reservaABorrar.id}?
            </h3>
            <p className="text-xs text-gray-500">
              Cliente: <strong>{reservaABorrar.clienteNombre}</strong> ({reservaABorrar.kitNombre}). Esta acción libera inmediatamente esas fechas en el calendario.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setReservaABorrar(null)}
                className="py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  eliminarReserva(reservaABorrar.id);
                  setReservaABorrar(null);
                }}
                className="py-3 rounded-2xl bg-rose-600 text-white font-extrabold text-xs"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL REPORTE PROFESIONAL PDF ================= */}
      {verReportePDF && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto print:static print:bg-white print:p-0 print:overflow-visible">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-4 print:shadow-none print:max-w-full print:my-0 print:p-0">
            {/* Encabezado del Reporte Ejecutivo */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-brand-pink pb-4">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-pink">
                  Reporte Administrativo y Contable
                </span>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  {negocioNombre}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Período filtrado ({tipoFecha === 'retiro' ? 'Retiro' : 'Creación'}):{' '}
                  <strong>{fechaDesde || 'Inicio'}</strong> hasta{' '}
                  <strong>{fechaHasta || 'Hoy'}</strong> • Estado:{' '}
                  <strong>{filtroEstado}</strong>
                </p>
              </div>
              <div className="text-right text-xs text-gray-500">
                <p>Emitido: {hoyStr}</p>
                <p>Total registros: {reservasFiltradas.length}</p>
              </div>
            </div>

            {/* KPIs Contables */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="text-gray-500 block">Facturado Total</span>
                <strong className="text-base text-gray-900">
                  {formatGuaranies(resumenReporte.totalFacturado)}
                </strong>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-700 block">Ingresos Cobrados</span>
                <strong className="text-base text-emerald-800">
                  {formatGuaranies(resumenReporte.totalCobrado)}
                </strong>
              </div>
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                <span className="text-rose-700 block">Saldo por Cobrar</span>
                <strong className="text-base text-rose-800">
                  {formatGuaranies(resumenReporte.totalPendiente)}
                </strong>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-amber-800 block">Descuentos Garantía</span>
                <strong className="text-base text-amber-900">
                  {formatGuaranies(resumenReporte.totalDescuentos)}
                </strong>
              </div>
            </div>

            {/* Desglose por Método de Pago */}
            <div className="p-3.5 rounded-2xl bg-brand-bg border border-pink-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-extrabold text-gray-800">
                Cobrado por Método:
              </span>
              <span>
                Transferencia/QR:{' '}
                <strong>
                  {formatGuaranies(resumenReporte.porMetodo.transferencia)}
                </strong>
              </span>
              <span>
                Bancard:{' '}
                <strong>{formatGuaranies(resumenReporte.porMetodo.bancard)}</strong>
              </span>
              <span>
                PIX:{' '}
                <strong>{formatGuaranies(resumenReporte.porMetodo.pix)}</strong>
              </span>
            </div>

            {/* Tabla Profesional */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-gray-600 uppercase">
                    <th className="py-2 pr-2">Código</th>
                    <th className="py-2 pr-2">Retiro</th>
                    <th className="py-2 pr-2">Kit</th>
                    <th className="py-2 pr-2">Cliente</th>
                    <th className="py-2 pr-2">Estado</th>
                    <th className="py-2 pr-2 text-right">Total</th>
                    <th className="py-2 pr-2 text-right">Cobrado</th>
                    <th className="py-2 text-right">Pendiente</th>
                  </tr>
                </thead>
                <tbody>
                  {reservasFiltradas.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100">
                      <td className="py-2 pr-2 font-bold text-brand-pink">
                        {r.id}
                      </td>
                      <td className="py-2 pr-2">{r.fechaRetiro}</td>
                      <td className="py-2 pr-2 font-semibold">{r.kitNombre}</td>
                      <td className="py-2 pr-2">{r.clienteNombre}</td>
                      <td className="py-2 pr-2">{r.estado}</td>
                      <td className="py-2 pr-2 text-right font-semibold">
                        {formatGuaranies(r.precioTotal)}
                      </td>
                      <td className="py-2 pr-2 text-right text-emerald-700 font-bold">
                        {formatGuaranies(calcularCobradoReserva(r))}
                      </td>
                      <td className="py-2 text-right text-rose-700 font-bold">
                        {formatGuaranies(calcularPendienteReserva(r))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 no-print">
              <button
                type="button"
                onClick={() => setVerReportePDF(false)}
                className="px-4 py-2.5 rounded-2xl bg-gray-100 text-gray-700 font-bold text-xs"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-2xl bg-brand-pink hover:bg-brand-pinkDark text-white font-extrabold text-xs flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                Imprimir / Guardar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL DEVOLUCIÓN ROTO ================= */}
      {modalRotoReserva && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 no-print">
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

      {/* ================= MODAL VISTA PREVIA COMPROBANTE ================= */}
      {comprobantePreview && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 no-print">
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
    </section>
  );
}
