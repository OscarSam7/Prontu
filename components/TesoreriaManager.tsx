'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  BookOpen,
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  Landmark,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react';
import { formatGuaranies } from '@/lib/kits';
import { useApp } from '@/lib/store';
import {
  CuentaTesoreria,
  GRUPO_RESULTADO_LABELS,
  GrupoResultado,
  METODOS_PAGO_TESORERIA,
  MetodoPagoTesoreria,
  MovimientoTesoreria,
  TipoMovimiento,
} from '@/lib/tesoreria';

interface TesoreriaManagerProps {
  negocioId: string;
  negocioNombre?: string;
}

const getFirstDayOfMonth = (yearOffset = 0, monthOffset = 0): string => {
  const now = new Date();
  const d = new Date(now.getFullYear() + yearOffset, now.getMonth() + monthOffset, 1);
  return d.toISOString().split('T')[0];
};

const getLastDayOfPrevMonth = (): string => {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), 0);
  return d.toISOString().split('T')[0];
};

const GRUPOS_POR_TIPO: Record<TipoMovimiento, GrupoResultado[]> = {
  ingreso: ['ingreso_operativo', 'otros_ingresos'],
  egreso: ['costo_directo', 'gasto_operativo', 'otros_egresos'],
};

interface ResumenCuentaLinea {
  cuentaId: string;
  codigo: string;
  nombre: string;
  grupoResultado: GrupoResultado;
  total: number;
  cantidad: number;
}

const buildResumenPorGrupo = (
  movimientos: MovimientoTesoreria[],
  grupo: GrupoResultado
): ResumenCuentaLinea[] => {
  const mapa = new Map<string, ResumenCuentaLinea>();
  movimientos
    .filter((m) => m.grupoResultado === grupo)
    .forEach((m) => {
      const key = `${m.cuentaCodigo}-${m.cuentaNombre}`;
      const existing = mapa.get(key);
      if (existing) {
        existing.total += m.monto;
        existing.cantidad += 1;
      } else {
        mapa.set(key, {
          cuentaId: m.cuentaId,
          codigo: m.cuentaCodigo,
          nombre: m.cuentaNombre,
          grupoResultado: m.grupoResultado,
          total: m.monto,
          cantidad: 1,
        });
      }
    });
  return Array.from(mapa.values()).sort((a, b) => a.codigo.localeCompare(b.codigo));
};

export default function TesoreriaManager({
  negocioId,
  negocioNombre = 'Pegue y Monte CDE',
}: TesoreriaManagerProps) {
  const {
    getCuentasByNegocio,
    getMovimientosByNegocio,
    agregarCuentaTesoreria,
    editarCuentaTesoreria,
    eliminarCuentaTesoreria,
    agregarMovimientoTesoreria,
    editarMovimientoTesoreria,
    eliminarMovimientoTesoreria,
    importarCobrosReservasATesoreria,
  } = useApp();

  const cuentas = getCuentasByNegocio(negocioId);
  const movimientos = getMovimientosByNegocio(negocioId);

  const hoyStr = new Date().toISOString().split('T')[0];
  const inicioMesStr = getFirstDayOfMonth(0, 0);

  const [subTab, setSubTab] = useState<'movimientos' | 'resultados' | 'cuentas'>(
    'movimientos'
  );

  // Filtros de período y búsqueda
  const [fechaDesde, setFechaDesde] = useState(inicioMesStr);
  const [fechaHasta, setFechaHasta] = useState(hoyStr);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | TipoMovimiento>('todos');
  const [filtroMetodo, setFiltroMetodo] = useState<'todos' | MetodoPagoTesoreria>('todos');
  const [filtroCuentaId, setFiltroCuentaId] = useState<string>('todas');
  const [busqueda, setBusqueda] = useState('');

  // Mensajes de feedback
  const [syncMensaje, setSyncMensaje] = useState<string | null>(null);

  // Modal Movimiento (Nuevo / Editar)
  const [modalMovOpen, setModalMovOpen] = useState(false);
  const [editingMov, setEditingMov] = useState<MovimientoTesoreria | null>(null);
  const [movFecha, setMovFecha] = useState(hoyStr);
  const [movTipo, setMovTipo] = useState<TipoMovimiento>('ingreso');
  const [movCuentaId, setMovCuentaId] = useState('');
  const [movConcepto, setMovConcepto] = useState('');
  const [movMonto, setMovMonto] = useState('');
  const [movMetodo, setMovMetodo] = useState<MetodoPagoTesoreria>('transferencia');
  const [movRef, setMovRef] = useState('');

  // Modal Eliminar Movimiento
  const [movABorrar, setMovABorrar] = useState<MovimientoTesoreria | null>(null);

  // Modal Cuenta Contable (Nueva / Editar)
  const [modalCuentaOpen, setModalCuentaOpen] = useState(false);
  const [editingCuenta, setEditingCuenta] = useState<CuentaTesoreria | null>(null);
  const [ctaCodigo, setCtaCodigo] = useState('');
  const [ctaNombre, setCtaNombre] = useState('');
  const [ctaTipo, setCtaTipo] = useState<TipoMovimiento>('egreso');
  const [ctaGrupo, setCtaGrupo] = useState<GrupoResultado>('gasto_operativo');
  const [ctaActiva, setCtaActiva] = useState(true);

  // Modal Reporte PDF Resultados del Ejercicio
  const [verReportePDF, setVerReportePDF] = useState(false);

  // Movimientos filtrados por período y criterios
  const movimientosPorPeriodo = useMemo(() => {
    return movimientos.filter((m) => {
      if (fechaDesde && m.fecha < fechaDesde) return false;
      if (fechaHasta && m.fecha > fechaHasta) return false;
      if (filtroMetodo !== 'todos' && m.metodoPago !== filtroMetodo) return false;
      return true;
    });
  }, [movimientos, fechaDesde, fechaHasta, filtroMetodo]);

  const movimientosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return movimientosPorPeriodo.filter((m) => {
      if (filtroTipo !== 'todos' && m.tipo !== filtroTipo) return false;
      if (filtroCuentaId !== 'todas' && m.cuentaId !== filtroCuentaId) return false;
      if (q) {
        const hit =
          m.concepto.toLowerCase().includes(q) ||
          m.cuentaNombre.toLowerCase().includes(q) ||
          m.cuentaCodigo.toLowerCase().includes(q) ||
          (m.comprobanteRef || '').toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [movimientosPorPeriodo, filtroTipo, filtroCuentaId, busqueda]);

  // Cálculos del Informe de Resultados del Ejercicio (sobre movimientosPorPeriodo)
  const estadoResultados = useMemo(() => {
    const ingresosOpLineas = buildResumenPorGrupo(
      movimientosPorPeriodo,
      'ingreso_operativo'
    );
    const costosDirLineas = buildResumenPorGrupo(movimientosPorPeriodo, 'costo_directo');
    const gastosOpLineas = buildResumenPorGrupo(movimientosPorPeriodo, 'gasto_operativo');
    const otrosIngresosLineas = buildResumenPorGrupo(
      movimientosPorPeriodo,
      'otros_ingresos'
    );
    const otrosEgresosLineas = buildResumenPorGrupo(
      movimientosPorPeriodo,
      'otros_egresos'
    );

    const totalIngresosOp = ingresosOpLineas.reduce((acc, i) => acc + i.total, 0);
    const totalCostosDir = costosDirLineas.reduce((acc, i) => acc + i.total, 0);
    const utilidadBruta = totalIngresosOp - totalCostosDir;
    const totalGastosOp = gastosOpLineas.reduce((acc, i) => acc + i.total, 0);
    const resultadoOperativo = utilidadBruta - totalGastosOp;
    const totalOtrosIngresos = otrosIngresosLineas.reduce((acc, i) => acc + i.total, 0);
    const totalOtrosEgresos = otrosEgresosLineas.reduce((acc, i) => acc + i.total, 0);
    const resultadoNeto =
      resultadoOperativo + totalOtrosIngresos - totalOtrosEgresos;

    const totalIngresos = totalIngresosOp + totalOtrosIngresos;
    const totalEgresos = totalCostosDir + totalGastosOp + totalOtrosEgresos;
    const margenBrutoPct =
      totalIngresosOp > 0 ? Math.round((utilidadBruta / totalIngresosOp) * 100) : 0;
    const margenNetoPct =
      totalIngresos > 0 ? Math.round((resultadoNeto / totalIngresos) * 100) : 0;

    const porMetodo = METODOS_PAGO_TESORERIA.map((met) => {
      const movsMet = movimientosPorPeriodo.filter((m) => m.metodoPago === met.id);
      const ing = movsMet
        .filter((m) => m.tipo === 'ingreso')
        .reduce((a, b) => a + b.monto, 0);
      const egr = movsMet
        .filter((m) => m.tipo === 'egreso')
        .reduce((a, b) => a + b.monto, 0);
      return {
        ...met,
        ingresos: ing,
        egresos: egr,
        saldo: ing - egr,
      };
    });

    return {
      ingresosOpLineas,
      costosDirLineas,
      gastosOpLineas,
      otrosIngresosLineas,
      otrosEgresosLineas,
      totalIngresosOp,
      totalCostosDir,
      utilidadBruta,
      totalGastosOp,
      resultadoOperativo,
      totalOtrosIngresos,
      totalOtrosEgresos,
      resultadoNeto,
      totalIngresos,
      totalEgresos,
      margenBrutoPct,
      margenNetoPct,
      porMetodo,
    };
  }, [movimientosPorPeriodo]);

  const setRangoRapido = (tipo: 'mes' | 'mes_anterior' | 'anio' | 'todo') => {
    const year = new Date().getFullYear();
    if (tipo === 'mes') {
      setFechaDesde(getFirstDayOfMonth(0, 0));
      setFechaHasta(hoyStr);
    } else if (tipo === 'mes_anterior') {
      setFechaDesde(getFirstDayOfMonth(0, -1));
      setFechaHasta(getLastDayOfPrevMonth());
    } else if (tipo === 'anio') {
      setFechaDesde(`${year}-01-01`);
      setFechaHasta(`${year}-12-31`);
    } else {
      setFechaDesde('');
      setFechaHasta('');
    }
  };

  const openNuevoMovimiento = (tipoInicial: TipoMovimiento) => {
    const cuentasTipo = cuentas.filter((c) => c.tipo === tipoInicial && c.activa);
    setEditingMov(null);
    setMovTipo(tipoInicial);
    setMovFecha(hoyStr);
    setMovCuentaId(cuentasTipo[0]?.id || cuentas[0]?.id || '');
    setMovConcepto('');
    setMovMonto('');
    setMovMetodo('transferencia');
    setMovRef('');
    setModalMovOpen(true);
  };

  const openEditarMovimiento = (m: MovimientoTesoreria) => {
    setEditingMov(m);
    setMovTipo(m.tipo);
    setMovFecha(m.fecha);
    setMovCuentaId(m.cuentaId);
    setMovConcepto(m.concepto);
    setMovMonto(String(m.monto));
    setMovMetodo(m.metodoPago);
    setMovRef(m.comprobanteRef || '');
    setModalMovOpen(true);
  };

  const handleChangeTipoMov = (nuevoTipo: TipoMovimiento) => {
    setMovTipo(nuevoTipo);
    const cuentasTipo = cuentas.filter((c) => c.tipo === nuevoTipo && c.activa);
    if (cuentasTipo.length > 0) {
      setMovCuentaId(cuentasTipo[0].id);
    }
  };

  const handleGuardarMovimiento = (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = Number(movMonto) || 0;
    if (montoNum <= 0 || !movConcepto.trim()) return;

    const cta =
      cuentas.find((c) => c.id === movCuentaId) ||
      cuentas.find((c) => c.tipo === movTipo) ||
      cuentas[0];
    if (!cta) return;

    if (editingMov) {
      editarMovimientoTesoreria({
        ...editingMov,
        fecha: movFecha || hoyStr,
        tipo: cta.tipo,
        cuentaId: cta.id,
        cuentaCodigo: cta.codigo,
        cuentaNombre: cta.nombre,
        grupoResultado: cta.grupoResultado,
        concepto: movConcepto.trim(),
        monto: montoNum,
        metodoPago: movMetodo,
        comprobanteRef: movRef.trim() || undefined,
      });
    } else {
      agregarMovimientoTesoreria({
        negocioId,
        fecha: movFecha || hoyStr,
        tipo: cta.tipo,
        cuentaId: cta.id,
        cuentaCodigo: cta.codigo,
        cuentaNombre: cta.nombre,
        grupoResultado: cta.grupoResultado,
        concepto: movConcepto.trim(),
        monto: montoNum,
        metodoPago: movMetodo,
        comprobanteRef: movRef.trim() || undefined,
      });
    }
    setModalMovOpen(false);
  };

  const openNuevaCuenta = () => {
    setEditingCuenta(null);
    setCtaCodigo('');
    setCtaNombre('');
    setCtaTipo('egreso');
    setCtaGrupo('gasto_operativo');
    setCtaActiva(true);
    setModalCuentaOpen(true);
  };

  const openEditarCuenta = (cta: CuentaTesoreria) => {
    setEditingCuenta(cta);
    setCtaCodigo(cta.codigo);
    setCtaNombre(cta.nombre);
    setCtaTipo(cta.tipo);
    setCtaGrupo(cta.grupoResultado);
    setCtaActiva(cta.activa);
    setModalCuentaOpen(true);
  };

  const handleChangeTipoCuenta = (nuevoTipo: TipoMovimiento) => {
    setCtaTipo(nuevoTipo);
    setCtaGrupo(nuevoTipo === 'ingreso' ? 'ingreso_operativo' : 'gasto_operativo');
  };

  const handleGuardarCuenta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ctaCodigo.trim() || !ctaNombre.trim()) return;

    if (editingCuenta) {
      editarCuentaTesoreria({
        ...editingCuenta,
        codigo: ctaCodigo.trim(),
        nombre: ctaNombre.trim(),
        tipo: ctaTipo,
        grupoResultado: ctaGrupo,
        activa: ctaActiva,
      });
    } else {
      agregarCuentaTesoreria({
        negocioId,
        codigo: ctaCodigo.trim(),
        nombre: ctaNombre.trim(),
        tipo: ctaTipo,
        grupoResultado: ctaGrupo,
        activa: ctaActiva,
      });
    }
    setModalCuentaOpen(false);
  };

  const handleSincronizarReservas = () => {
    const importadas = importarCobrosReservasATesoreria(negocioId);
    if (importadas > 0) {
      setSyncMensaje(
        `Se importaron ${importadas} reserva(s) cobrada(s) al libro de Tesorería.`
      );
    } else {
      setSyncMensaje(
        'Todas las reservas cobradas ya estaban registradas en Tesorería.'
      );
    }
    setTimeout(() => setSyncMensaje(null), 5000);
  };

  const handleExportarCSV = () => {
    const escapeCsv = (val: string | number | undefined) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    const headers = [
      'Fecha',
      'Tipo',
      'Código Cuenta',
      'Cuenta Contable',
      'Clasificación Resultado',
      'Concepto',
      'Medio de Pago',
      'Comprobante / Ref',
      'Ingreso (Gs.)',
      'Egreso (Gs.)',
    ];

    const rows = movimientosFiltrados.map((m) => [
      m.fecha,
      m.tipo === 'ingreso' ? 'Ingreso' : 'Egreso',
      m.cuentaCodigo,
      m.cuentaNombre,
      GRUPO_RESULTADO_LABELS[m.grupoResultado],
      m.concepto,
      m.metodoPago.toUpperCase(),
      m.comprobanteRef || '-',
      m.tipo === 'ingreso' ? m.monto : 0,
      m.tipo === 'egreso' ? m.monto : 0,
    ]);

    const er = estadoResultados;
    rows.push(['', '', '', '', '', '', '', '', '', '']);
    rows.push([
      'ESTADO DE RESULTADOS DEL EJERCICIO',
      `${fechaDesde || 'Inicio'} a ${fechaHasta || 'Hoy'}`,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ]);
    rows.push(['', 'Ingresos Operativos', '', '', '', '', '', '', er.totalIngresosOp, 0]);
    rows.push(['', '(-) Costos Directos', '', '', '', '', '', '', 0, er.totalCostosDir]);
    rows.push(['', '(=) Utilidad Bruta', '', '', '', '', '', '', er.utilidadBruta, 0]);
    rows.push(['', '(-) Gastos Operativos', '', '', '', '', '', '', 0, er.totalGastosOp]);
    rows.push([
      '',
      '(=) Resultado Operativo (EBIT)',
      '',
      '',
      '',
      '',
      '',
      '',
      er.resultadoOperativo,
      0,
    ]);
    rows.push(['', '(+) Otros Ingresos', '', '', '', '', '', '', er.totalOtrosIngresos, 0]);
    rows.push(['', '(-) Otros Egresos/Impuestos', '', '', '', '', '', '', 0, er.totalOtrosEgresos]);
    rows.push([
      '',
      '(=) RESULTADO NETO DEL EJERCICIO',
      '',
      '',
      '',
      '',
      '',
      '',
      er.resultadoNeto,
      0,
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.map(escapeCsv).join(';'), ...rows.map((r) => r.map(escapeCsv).join(';'))].join(
        '\r\n'
      );

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tesoreria-resultados-${fechaDesde || 'inicio'}-${fechaHasta || hoyStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderGrupoTablaER = (
    titulo: string,
    lineas: ResumenCuentaLinea[],
    total: number,
    signo: '+' | '-',
    colorClass: string
  ) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-extrabold text-gray-800 border-b border-gray-200 pb-1">
        <span>
          {signo} {titulo}
        </span>
        <span className={colorClass}>{formatGuaranies(total)}</span>
      </div>
      {lineas.length === 0 ? (
        <p className="text-[11px] text-gray-400 italic pl-3">
          Sin movimientos registrados en este grupo.
        </p>
      ) : (
        <div className="space-y-1 pl-2 sm:pl-4">
          {lineas.map((l) => (
            <div
              key={`${l.codigo}-${l.nombre}`}
              className="flex items-center justify-between text-xs text-gray-700"
            >
              <span>
                <span className="font-mono text-[11px] text-gray-400 mr-1.5">
                  {l.codigo}
                </span>
                {l.nombre}{' '}
                <span className="text-[10px] text-gray-400">({l.cantidad})</span>
              </span>
              <span className="font-bold">{formatGuaranies(l.total)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderEstadoResultadosContenido = (modoImpresion = false) => {
    const er = estadoResultados;
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-gray-200 p-4 space-y-4 bg-white">
          {renderGrupoTablaER(
            'I. Ingresos Operativos',
            er.ingresosOpLineas,
            er.totalIngresosOp,
            '+',
            'text-emerald-700'
          )}
          {renderGrupoTablaER(
            'II. Costos Directos del Servicio',
            er.costosDirLineas,
            er.totalCostosDir,
            '-',
            'text-rose-700'
          )}

          <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs sm:text-sm font-extrabold">
            <span className="text-teal-900">
              (=) UTILIDAD BRUTA OPERATIVA (Margen Bruto: {er.margenBrutoPct}%)
            </span>
            <span className="text-teal-800">{formatGuaranies(er.utilidadBruta)}</span>
          </div>

          {renderGrupoTablaER(
            'III. Gastos Operativos y Administrativos',
            er.gastosOpLineas,
            er.totalGastosOp,
            '-',
            'text-rose-700'
          )}

          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-100 border border-gray-200 text-xs sm:text-sm font-extrabold">
            <span className="text-gray-800">(=) RESULTADO OPERATIVO (EBIT)</span>
            <span
              className={
                er.resultadoOperativo >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }
            >
              {formatGuaranies(er.resultadoOperativo)}
            </span>
          </div>

          {renderGrupoTablaER(
            'IV. Otros Ingresos',
            er.otrosIngresosLineas,
            er.totalOtrosIngresos,
            '+',
            'text-emerald-700'
          )}
          {renderGrupoTablaER(
            'V. Otros Egresos, Impuestos y Financieros',
            er.otrosEgresosLineas,
            er.totalOtrosEgresos,
            '-',
            'text-rose-700'
          )}

          <div
            className={`flex flex-wrap items-center justify-between gap-2 p-4 rounded-2xl border-2 text-sm sm:text-base font-extrabold ${
              er.resultadoNeto >= 0
                ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                : 'bg-rose-50 border-rose-400 text-rose-900'
            }`}
          >
            <span>
              (=) RESULTADO NETO DEL EJERCICIO (
              {er.resultadoNeto >= 0 ? 'UTILIDAD' : 'PÉRDIDA'} • Margen:{' '}
              {er.margenNetoPct}%)
            </span>
            <span className="text-lg sm:text-xl">
              {formatGuaranies(er.resultadoNeto)}
            </span>
          </div>
        </div>

        {/* Flujo de Caja por Medio de Pago */}
        <div className="rounded-2xl border border-gray-200 p-4 bg-white space-y-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700">
            Saldo Neto de Tesorería por Medio de Pago
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
            {er.porMetodo.map((m) => (
              <div
                key={m.id}
                className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1"
              >
                <span className="font-extrabold text-gray-800 block">{m.label}</span>
                <div className="flex justify-between text-[11px] text-emerald-700">
                  <span>Ingresos:</span>
                  <strong>{formatGuaranies(m.ingresos)}</strong>
                </div>
                <div className="flex justify-between text-[11px] text-rose-700">
                  <span>Egresos:</span>
                  <strong>{formatGuaranies(m.egresos)}</strong>
                </div>
                <div className="flex justify-between text-xs border-t border-gray-200 pt-1 font-extrabold">
                  <span>Neto:</span>
                  <span className={m.saldo >= 0 ? 'text-gray-900' : 'text-rose-700'}>
                    {formatGuaranies(m.saldo)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!modoImpresion && (
          <div className="flex flex-wrap justify-end gap-2 no-print">
            <button
              type="button"
              onClick={handleExportarCSV}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-extrabold inline-flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Exportar Excel (CSV)
            </button>
            <button
              type="button"
              onClick={() => setVerReportePDF(true)}
              className="px-4 py-2.5 rounded-2xl bg-gray-900 text-white text-xs font-extrabold inline-flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              Vista Previa / Guardar PDF
            </button>
          </div>
        )}
      </div>
    );
  };

  const cuentasParaFormMov = cuentas.filter((c) => c.tipo === movTipo && c.activa);

  return (
    <section className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-pink-100 space-y-5 print:bg-transparent print:shadow-none print:border-0 print:p-0">
      <div className={`space-y-5 ${verReportePDF ? 'no-print' : ''}`}>
        {/* Encabezado Tesorería */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-teal flex items-center gap-1">
              <Landmark className="w-3.5 h-3.5" /> Módulo Contable y Financiero
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
              Tesorería, Plan de Cuentas y Resultados del Ejercicio
            </h2>
            <p className="text-xs text-gray-500">
              Registrá ingresos y egresos por cuenta contable y generá tu Estado de Resultados.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openNuevoMovimiento('ingreso')}
              className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold inline-flex items-center gap-1.5 shadow-sm transition"
            >
              <ArrowUpCircle className="w-4 h-4" />
              + Registrar Ingreso
            </button>
            <button
              type="button"
              onClick={() => openNuevoMovimiento('egreso')}
              className="px-3.5 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold inline-flex items-center gap-1.5 shadow-sm transition"
            >
              <ArrowDownCircle className="w-4 h-4" />
              + Registrar Egreso
            </button>
            <button
              type="button"
              onClick={handleSincronizarReservas}
              className="px-3.5 py-2 rounded-2xl bg-teal-50 hover:bg-teal-100 text-brand-teal border border-teal-200 text-xs font-extrabold inline-flex items-center gap-1.5 transition"
              title="Importar señas y pagos de reservas a Tesorería"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Importar Reservas
            </button>
            <button
              type="button"
              onClick={handleExportarCSV}
              className="px-3 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-extrabold inline-flex items-center gap-1.5 transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              CSV
            </button>
            <button
              type="button"
              onClick={() => setVerReportePDF(true)}
              className="px-3.5 py-2 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-extrabold inline-flex items-center gap-1.5 shadow-sm transition"
            >
              <FileText className="w-4 h-4 text-amber-300" />
              Informe PDF
            </button>
          </div>
        </div>

        {syncMensaje && (
          <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800">
            {syncMensaje}
          </div>
        )}

        {/* 4 KPIs Financieros del Período */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Total Ingresos
            </span>
            <p className="text-base sm:text-lg font-extrabold text-emerald-800 mt-0.5">
              {formatGuaranies(estadoResultados.totalIngresos)}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
            <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" /> Total Egresos
            </span>
            <p className="text-base sm:text-lg font-extrabold text-rose-800 mt-0.5">
              {formatGuaranies(estadoResultados.totalEgresos)}
            </p>
          </div>

          <div
            className={`p-3.5 rounded-2xl border ${
              estadoResultados.resultadoNeto >= 0
                ? 'bg-teal-50 border-teal-200'
                : 'bg-amber-50 border-amber-300'
            }`}
          >
            <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-brand-teal" /> Resultado del Ejercicio
            </span>
            <p
              className={`text-base sm:text-lg font-extrabold mt-0.5 ${
                estadoResultados.resultadoNeto >= 0
                  ? 'text-teal-900'
                  : 'text-rose-700'
              }`}
            >
              {formatGuaranies(estadoResultados.resultadoNeto)}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-brand-bg border border-pink-100">
            <span className="text-[11px] font-bold text-gray-600 block">
              Utilidad Bruta / Margen
            </span>
            <p className="text-sm sm:text-base font-extrabold text-gray-900 mt-0.5">
              {formatGuaranies(estadoResultados.utilidadBruta)}
            </p>
            <span className="text-[10px] font-bold text-brand-pink">
              Margen Neto: {estadoResultados.margenNetoPct}%
            </span>
          </div>
        </div>

        {/* Filtros por Período (Desde / Hasta) */}
        <div className="p-3.5 rounded-2xl bg-brand-bg border border-pink-100 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
            <div>
              <label className="block font-bold text-gray-600 mb-1">
                Período Desde:
              </label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-pink-200 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-600 mb-1">
                Período Hasta:
              </label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-pink-200 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-600 mb-1">
                Medio de Pago:
              </label>
              <select
                value={filtroMetodo}
                onChange={(e) =>
                  setFiltroMetodo(e.target.value as 'todos' | MetodoPagoTesoreria)
                }
                className="w-full px-3 py-2 rounded-xl bg-white border border-pink-200 font-bold"
              >
                <option value="todos">Todos los medios</option>
                {METODOS_PAGO_TESORERIA.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-600 mb-1">
                Buscar concepto / comprobante:
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Ej: Alquiler, SIPAP, ANDE..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-pink-200 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-gray-500 mr-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Ejercicio rápido:
              </span>
              <button
                type="button"
                onClick={() => setRangoRapido('mes')}
                className="px-2.5 py-1 rounded-xl bg-white border border-pink-200 text-[11px] font-bold text-gray-700 hover:bg-pink-50"
              >
                Este Mes
              </button>
              <button
                type="button"
                onClick={() => setRangoRapido('mes_anterior')}
                className="px-2.5 py-1 rounded-xl bg-white border border-pink-200 text-[11px] font-bold text-gray-700 hover:bg-pink-50"
              >
                Mes Anterior
              </button>
              <button
                type="button"
                onClick={() => setRangoRapido('anio')}
                className="px-2.5 py-1 rounded-xl bg-white border border-pink-200 text-[11px] font-bold text-gray-700 hover:bg-pink-50"
              >
                Año {new Date().getFullYear()}
              </button>
              <button
                type="button"
                onClick={() => setRangoRapido('todo')}
                className="px-2.5 py-1 rounded-xl bg-gray-200 text-[11px] font-bold text-gray-700"
              >
                Todo el Historial
              </button>
            </div>
          </div>
        </div>

        {/* Sub-Tabs Internas */}
        <div className="flex flex-wrap items-center gap-2 border-b border-pink-100 pb-3">
          <button
            type="button"
            onClick={() => setSubTab('movimientos')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition ${
              subTab === 'movimientos'
                ? 'bg-brand-pink text-white shadow'
                : 'bg-brand-bg text-gray-700 hover:bg-pink-50'
            }`}
          >
            Libro de Ingresos y Egresos ({movimientosFiltrados.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('resultados')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition inline-flex items-center gap-1.5 ${
              subTab === 'resultados'
                ? 'bg-brand-teal text-white shadow'
                : 'bg-brand-bg text-gray-700 hover:bg-teal-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Informe de Resultados del Ejercicio
          </button>
          <button
            type="button"
            onClick={() => setSubTab('cuentas')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition inline-flex items-center gap-1.5 ${
              subTab === 'cuentas'
                ? 'bg-gray-900 text-white shadow'
                : 'bg-brand-bg text-gray-700 hover:bg-gray-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Plan de Cuentas ({cuentas.length})
          </button>
        </div>

        {/* ==================== SUBTAB 1: MOVIMIENTOS ==================== */}
        {subTab === 'movimientos' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {(['todos', 'ingreso', 'egreso'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFiltroTipo(t)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition ${
                      filtroTipo === t
                        ? 'bg-gray-900 text-white'
                        : 'bg-brand-bg text-gray-600 border border-pink-100'
                    }`}
                  >
                    {t === 'todos' ? 'Todos' : t === 'ingreso' ? 'Ingresos' : 'Egresos'}
                  </button>
                ))}
              </div>

              <select
                value={filtroCuentaId}
                onChange={(e) => setFiltroCuentaId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-brand-bg border border-pink-100 text-xs font-bold"
              >
                <option value="todas">Todas las cuentas contables</option>
                {cuentas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.codigo} - {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2.5">
              {movimientosFiltrados.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-2xl bg-brand-bg border border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          m.tipo === 'ingreso'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {m.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                      </span>
                      <span className="text-xs font-mono font-bold text-gray-700 bg-white px-2 py-0.5 rounded-lg border border-gray-200">
                        {m.cuentaCodigo} • {m.cuentaNombre}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-pink-50 text-brand-pink">
                        {GRUPO_RESULTADO_LABELS[m.grupoResultado]}
                      </span>
                    </div>
                    <p className="font-extrabold text-sm text-gray-900">
                      {m.concepto}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Fecha: <strong>{m.fecha}</strong> • Medio:{' '}
                      <strong>{m.metodoPago.toUpperCase()}</strong>
                      {m.comprobanteRef ? ` • Ref: ${m.comprobanteRef}` : ''}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <span
                      className={`text-base font-extrabold ${
                        m.tipo === 'ingreso' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {m.tipo === 'ingreso' ? '+' : '-'} {formatGuaranies(m.monto)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditarMovimiento(m)}
                        className="px-2.5 py-1 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 inline-flex items-center gap-1 hover:bg-gray-50"
                      >
                        <Pencil className="w-3 h-3" /> Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setMovABorrar(m)}
                        className="p-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100"
                        title="Eliminar movimiento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {movimientosFiltrados.length === 0 && (
                <div className="p-8 text-center text-xs text-gray-500">
                  No hay movimientos registrados para este rango de fechas o filtro.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== SUBTAB 2: INFORME DE RESULTADOS ==================== */}
        {subTab === 'resultados' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-brand-bg p-3.5 rounded-2xl border border-pink-100">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">
                  Estado de Resultados del Ejercicio — {negocioNombre}
                </h3>
                <p className="text-[11px] text-gray-500">
                  Período analizado: {fechaDesde || 'Inicio'} al {fechaHasta || 'Hoy'}
                </p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-white border border-pink-100 text-gray-700">
                Base: {movimientosPorPeriodo.length} asiento(s)
              </span>
            </div>
            {renderEstadoResultadosContenido(false)}
          </div>
        )}

        {/* ==================== SUBTAB 3: PLAN DE CUENTAS ==================== */}
        {subTab === 'cuentas' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">
                  Plan de Cuentas Contable para Resultados del Ejercicio
                </h3>
                <p className="text-xs text-gray-500">
                  Creá o editá los tipos de cuentas de Ingresos, Costos Directos, Gastos Operativos e Impuestos.
                </p>
              </div>
              <button
                type="button"
                onClick={openNuevaCuenta}
                className="px-3.5 py-2 rounded-2xl bg-gray-900 text-white text-xs font-extrabold inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Nueva Cuenta Contable
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {cuentas.map((c) => {
                const usados = movimientos.filter((m) => m.cuentaId === c.id).length;
                return (
                  <div
                    key={c.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
                      c.activa
                        ? 'bg-brand-bg border-pink-100'
                        : 'bg-gray-50 border-gray-200 opacity-70'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-xs font-extrabold text-gray-900 bg-white px-2 py-0.5 rounded-lg border border-gray-200">
                          {c.codigo}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                            c.tipo === 'ingreso'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {c.tipo}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500">
                          {GRUPO_RESULTADO_LABELS[c.grupoResultado]}
                        </span>
                      </div>
                      <p className="font-extrabold text-xs text-gray-900 mt-1 truncate">
                        {c.nombre}
                      </p>
                      <span className="text-[10px] text-gray-400">
                        {usados} movimiento(s) • {c.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditarCuenta(c)}
                        className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                        title="Editar cuenta"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {!c.sistema && usados === 0 && (
                        <button
                          type="button"
                          onClick={() => eliminarCuentaTesoreria(c.id)}
                          className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100"
                          title="Eliminar cuenta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL REGISTRAR / EDITAR MOVIMIENTO ================= */}
      {modalMovOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 my-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[11px] font-extrabold text-brand-teal uppercase">
                  Tesorería • {editingMov ? 'Editar Asiento' : 'Nuevo Asiento'}
                </span>
                <h3 className="text-lg font-extrabold text-gray-900">
                  {movTipo === 'ingreso' ? 'Registrar Ingreso' : 'Registrar Egreso'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalMovOpen(false)}
                className="p-1.5 rounded-xl bg-gray-100 text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarMovimiento} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleChangeTipoMov('ingreso')}
                  className={`py-2.5 rounded-xl font-extrabold border transition ${
                    movTipo === 'ingreso'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}
                >
                  + Ingreso
                </button>
                <button
                  type="button"
                  onClick={() => handleChangeTipoMov('egreso')}
                  className={`py-2.5 rounded-xl font-extrabold border transition ${
                    movTipo === 'egreso'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}
                >
                  - Egreso
                </button>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Cuenta Contable *
                </label>
                <select
                  value={movCuentaId}
                  onChange={(e) => setMovCuentaId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-bold"
                >
                  {cuentasParaFormMov.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.codigo} — {c.nombre} ({GRUPO_RESULTADO_LABELS[c.grupoResultado]})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    required
                    value={movFecha}
                    onChange={(e) => setMovFecha(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Monto (Gs.) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={movMonto}
                    onChange={(e) => setMovMonto(e.target.value)}
                    placeholder="Ej: 450000"
                    className="w-full px-3 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-extrabold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Concepto / Detalle *
                </label>
                <input
                  type="text"
                  required
                  value={movConcepto}
                  onChange={(e) => setMovConcepto(e.target.value)}
                  placeholder="Ej: Pago de alquiler local, compra globos, cobro saldo..."
                  className="w-full px-3 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Medio de Pago
                  </label>
                  <select
                    value={movMetodo}
                    onChange={(e) =>
                      setMovMetodo(e.target.value as MetodoPagoTesoreria)
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-bold"
                  >
                    {METODOS_PAGO_TESORERIA.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Nro. Factura / Ref.
                  </label>
                  <input
                    type="text"
                    value={movRef}
                    onChange={(e) => setMovRef(e.target.value)}
                    placeholder="Opcional"
                    className="w-full px-3 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalMovOpen(false)}
                  className="py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-3 rounded-2xl bg-brand-pink text-white font-extrabold shadow"
                >
                  {editingMov ? 'Guardar Cambios' : 'Guardar Movimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL BORRAR MOVIMIENTO ================= */}
      {movABorrar && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-gray-900">
              ¿Eliminar movimiento?
            </h3>
            <p className="text-xs text-gray-600">
              <strong>{movABorrar.concepto}</strong> ({formatGuaranies(movABorrar.monto)}). Se descontará del informe de resultados.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setMovABorrar(null)}
                className="py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  eliminarMovimientoTesoreria(movABorrar.id);
                  setMovABorrar(null);
                }}
                className="py-3 rounded-2xl bg-rose-600 text-white font-extrabold text-xs"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL CREAR / EDITAR CUENTA CONTABLE ================= */}
      {modalCuentaOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-extrabold text-gray-900">
                {editingCuenta ? 'Editar Cuenta Contable' : 'Nueva Cuenta Contable'}
              </h3>
              <button
                type="button"
                onClick={() => setModalCuentaOpen(false)}
                className="p-1.5 rounded-xl bg-gray-100 text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarCuenta} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Código *
                  </label>
                  <input
                    type="text"
                    required
                    value={ctaCodigo}
                    onChange={(e) => setCtaCodigo(e.target.value)}
                    placeholder="Ej: 5.2.07"
                    className="w-full px-3 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-mono font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">
                    Nombre de la Cuenta *
                  </label>
                  <input
                    type="text"
                    required
                    value={ctaNombre}
                    onChange={(e) => setCtaNombre(e.target.value)}
                    placeholder="Ej: Viáticos y Refrigerios"
                    className="w-full px-3 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Naturaleza
                  </label>
                  <select
                    value={ctaTipo}
                    onChange={(e) =>
                      handleChangeTipoCuenta(e.target.value as TipoMovimiento)
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-bold"
                  >
                    <option value="ingreso">Ingreso (+)</option>
                    <option value="egreso">Egreso (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Grupo en Estado de Resultados
                  </label>
                  <select
                    value={ctaGrupo}
                    onChange={(e) => setCtaGrupo(e.target.value as GrupoResultado)}
                    className="w-full px-3 py-2.5 rounded-xl bg-brand-bg border border-pink-100 font-bold"
                  >
                    {GRUPOS_POR_TIPO[ctaTipo].map((g) => (
                      <option key={g} value={g}>
                        {GRUPO_RESULTADO_LABELS[g]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 font-bold text-gray-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={ctaActiva}
                  onChange={(e) => setCtaActiva(e.target.checked)}
                  className="accent-brand-pink"
                />
                Cuenta activa para nuevos movimientos
              </label>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalCuentaOpen(false)}
                  className="py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-3 rounded-2xl bg-gray-900 text-white font-extrabold"
                >
                  Guardar Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL INFORME PDF RESULTADOS DEL EJERCICIO ================= */}
      {verReportePDF && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto print:static print:bg-white print:p-0 print:overflow-visible">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-4 print:shadow-none print:max-w-full print:my-0 print:p-0">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-brand-teal pb-4">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-teal">
                  Informe Contable • Estado de Resultados del Ejercicio
                </span>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  {negocioNombre}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Ejercicio / Período: <strong>{fechaDesde || 'Inicio'}</strong> al{' '}
                  <strong>{fechaHasta || 'Hoy'}</strong> • Asientos:{' '}
                  <strong>{movimientosPorPeriodo.length}</strong>
                </p>
              </div>
              <div className="text-right text-xs text-gray-500">
                <p className="font-bold text-gray-800">
                  Emitido: {new Date().toLocaleDateString('es-PY')}
                </p>
                <p>Moneda: Guaraníes (PYG)</p>
              </div>
            </div>

            {renderEstadoResultadosContenido(true)}

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
                className="px-5 py-2.5 rounded-2xl bg-brand-teal text-white font-extrabold text-xs inline-flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                Imprimir / Guardar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
