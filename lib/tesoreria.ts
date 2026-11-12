import { DEFAULT_NEGOCIO_ID } from './kits';

export type TipoMovimiento = 'ingreso' | 'egreso';

export type GrupoResultado =
  | 'ingreso_operativo'
  | 'otros_ingresos'
  | 'costo_directo'
  | 'gasto_operativo'
  | 'otros_egresos';

export type MetodoPagoTesoreria = 'efectivo' | 'transferencia' | 'bancard' | 'pix';

export interface CuentaTesoreria {
  id: string;
  negocioId: string;
  codigo: string;
  nombre: string;
  tipo: TipoMovimiento;
  grupoResultado: GrupoResultado;
  activa: boolean;
  sistema?: boolean;
}

export interface MovimientoTesoreria {
  id: string;
  negocioId: string;
  fecha: string; // YYYY-MM-DD
  tipo: TipoMovimiento;
  cuentaId: string;
  cuentaCodigo: string;
  cuentaNombre: string;
  grupoResultado: GrupoResultado;
  concepto: string;
  monto: number;
  metodoPago: MetodoPagoTesoreria;
  comprobanteRef?: string;
  reservaId?: string;
  creadoEn: string;
}

export const GRUPO_RESULTADO_LABELS: Record<GrupoResultado, string> = {
  ingreso_operativo: 'Ingresos Operativos',
  otros_ingresos: 'Otros Ingresos',
  costo_directo: 'Costos Directos del Servicio',
  gasto_operativo: 'Gastos Operativos y Administrativos',
  otros_egresos: 'Otros Egresos, Impuestos y Financieros',
};

export const METODOS_PAGO_TESORERIA: {
  id: MetodoPagoTesoreria;
  label: string;
}[] = [
  { id: 'efectivo', label: 'Efectivo (Caja)' },
  { id: 'transferencia', label: 'Transferencia / SIPAP' },
  { id: 'bancard', label: 'Tarjeta / Bancard POS' },
  { id: 'pix', label: 'PIX' },
];

export const PLAN_CUENTAS_BASE: Omit<CuentaTesoreria, 'id' | 'negocioId'>[] = [
  // INGRESOS OPERATIVOS (4.1)
  {
    codigo: '4.1.01',
    nombre: 'Alquiler de Kits de Decoración',
    tipo: 'ingreso',
    grupoResultado: 'ingreso_operativo',
    activa: true,
    sistema: true,
  },
  {
    codigo: '4.1.02',
    nombre: 'Alquiler Audiovisual / Sonido / Pantallas',
    tipo: 'ingreso',
    grupoResultado: 'ingreso_operativo',
    activa: true,
    sistema: true,
  },
  {
    codigo: '4.1.03',
    nombre: 'Servicio de Delivery y Traslado',
    tipo: 'ingreso',
    grupoResultado: 'ingreso_operativo',
    activa: true,
    sistema: true,
  },
  // OTROS INGRESOS (4.2)
  {
    codigo: '4.2.01',
    nombre: 'Cobros por Roturas / Limpieza / Penalidades',
    tipo: 'ingreso',
    grupoResultado: 'otros_ingresos',
    activa: true,
    sistema: true,
  },
  {
    codigo: '4.2.02',
    nombre: 'Otros Ingresos / Aportes de Capital',
    tipo: 'ingreso',
    grupoResultado: 'otros_ingresos',
    activa: true,
  },
  // COSTOS DIRECTOS (5.1)
  {
    codigo: '5.1.01',
    nombre: 'Reposición de Insumos, Globos y Fundas',
    tipo: 'egreso',
    grupoResultado: 'costo_directo',
    activa: true,
    sistema: true,
  },
  {
    codigo: '5.1.02',
    nombre: 'Fletes, Delivery Tercerizado y Combustible',
    tipo: 'egreso',
    grupoResultado: 'costo_directo',
    activa: true,
    sistema: true,
  },
  {
    codigo: '5.1.03',
    nombre: 'Mantenimiento y Reparación de Kits / Equipos',
    tipo: 'egreso',
    grupoResultado: 'costo_directo',
    activa: true,
    sistema: true,
  },
  // GASTOS OPERATIVOS (5.2)
  {
    codigo: '5.2.01',
    nombre: 'Alquiler de Local / Depósito',
    tipo: 'egreso',
    grupoResultado: 'gasto_operativo',
    activa: true,
    sistema: true,
  },
  {
    codigo: '5.2.02',
    nombre: 'Sueldos, Jornales y Ayudantes',
    tipo: 'egreso',
    grupoResultado: 'gasto_operativo',
    activa: true,
    sistema: true,
  },
  {
    codigo: '5.2.03',
    nombre: 'Servicios Básicos (ANDE, ESSAP, Internet)',
    tipo: 'egreso',
    grupoResultado: 'gasto_operativo',
    activa: true,
  },
  {
    codigo: '5.2.04',
    nombre: 'Publicidad y Marketing (Redes / Pauta)',
    tipo: 'egreso',
    grupoResultado: 'gasto_operativo',
    activa: true,
  },
  {
    codigo: '5.2.05',
    nombre: 'Software, Suscripción App y Honorarios',
    tipo: 'egreso',
    grupoResultado: 'gasto_operativo',
    activa: true,
  },
  {
    codigo: '5.2.06',
    nombre: 'Limpieza, Papelería y Gastos Generales',
    tipo: 'egreso',
    grupoResultado: 'gasto_operativo',
    activa: true,
  },
  // OTROS EGRESOS / IMPUESTOS (5.3)
  {
    codigo: '5.3.01',
    nombre: 'Impuestos (IVA / IRE / Patente Municipal)',
    tipo: 'egreso',
    grupoResultado: 'otros_egresos',
    activa: true,
  },
  {
    codigo: '5.3.02',
    nombre: 'Comisiones Bancarias / Bancard POS',
    tipo: 'egreso',
    grupoResultado: 'otros_egresos',
    activa: true,
  },
  {
    codigo: '5.3.03',
    nombre: 'Compra de Activos / Nuevos Kits y Paneles',
    tipo: 'egreso',
    grupoResultado: 'otros_egresos',
    activa: true,
  },
];

export const buildCuentasInicialesNegocio = (
  negocioId = DEFAULT_NEGOCIO_ID
): CuentaTesoreria[] =>
  PLAN_CUENTAS_BASE.map((c) => ({
    ...c,
    id: `cta-${negocioId}-${c.codigo.replace(/\./g, '')}`,
    negocioId,
  }));

export const CUENTAS_TESORERIA_INICIALES: CuentaTesoreria[] =
  buildCuentasInicialesNegocio(DEFAULT_NEGOCIO_ID);

const getOffsetDateStr = (daysOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

export const MOVIMIENTOS_TESORERIA_INICIALES: MovimientoTesoreria[] = [
  {
    id: 'MOV-2026-001',
    negocioId: DEFAULT_NEGOCIO_ID,
    fecha: getOffsetDateStr(-6),
    tipo: 'ingreso',
    cuentaId: `cta-${DEFAULT_NEGOCIO_ID}-4101`,
    cuentaCodigo: '4.1.01',
    cuentaNombre: 'Alquiler de Kits de Decoración',
    grupoResultado: 'ingreso_operativo',
    concepto: 'Cobro total Kit Safari Baby - Camila Benítez (PYM-2026-001)',
    monto: 650000,
    metodoPago: 'transferencia',
    comprobanteRef: 'SIPAP #44219',
    reservaId: 'PYM-2026-001',
    creadoEn: getOffsetDateStr(-6),
  },
  {
    id: 'MOV-2026-002',
    negocioId: DEFAULT_NEGOCIO_ID,
    fecha: getOffsetDateStr(-4),
    tipo: 'ingreso',
    cuentaId: `cta-${DEFAULT_NEGOCIO_ID}-4102`,
    cuentaCodigo: '4.1.02',
    cuentaNombre: 'Alquiler Audiovisual / Sonido / Pantallas',
    grupoResultado: 'ingreso_operativo',
    concepto: 'Seña 50% Combo Sonido + Luces - Eventos CDE',
    monto: 625000,
    metodoPago: 'pix',
    comprobanteRef: 'PIX-8812',
    creadoEn: getOffsetDateStr(-4),
  },
  {
    id: 'MOV-2026-003',
    negocioId: DEFAULT_NEGOCIO_ID,
    fecha: getOffsetDateStr(-3),
    tipo: 'egreso',
    cuentaId: `cta-${DEFAULT_NEGOCIO_ID}-5101`,
    cuentaCodigo: '5.1.01',
    cuentaNombre: 'Reposición de Insumos, Globos y Fundas',
    grupoResultado: 'costo_directo',
    concepto: 'Compra de fundas sublimadas y cintas de sujeción',
    monto: 240000,
    metodoPago: 'efectivo',
    comprobanteRef: 'Factura 001-002-001458',
    creadoEn: getOffsetDateStr(-3),
  },
  {
    id: 'MOV-2026-004',
    negocioId: DEFAULT_NEGOCIO_ID,
    fecha: getOffsetDateStr(-2),
    tipo: 'egreso',
    cuentaId: `cta-${DEFAULT_NEGOCIO_ID}-5201`,
    cuentaCodigo: '5.2.01',
    cuentaNombre: 'Alquiler de Local / Depósito',
    grupoResultado: 'gasto_operativo',
    concepto: 'Alquiler mensual depósito Km 4 CDE',
    monto: 1200000,
    metodoPago: 'transferencia',
    comprobanteRef: 'Recibo N° 104',
    creadoEn: getOffsetDateStr(-2),
  },
  {
    id: 'MOV-2026-005',
    negocioId: DEFAULT_NEGOCIO_ID,
    fecha: getOffsetDateStr(-1),
    tipo: 'egreso',
    cuentaId: `cta-${DEFAULT_NEGOCIO_ID}-5204`,
    cuentaCodigo: '5.2.04',
    cuentaNombre: 'Publicidad y Marketing (Redes / Pauta)',
    grupoResultado: 'gasto_operativo',
    concepto: 'Pauta Instagram Reels Kits de Cumpleaños CDE',
    monto: 180000,
    metodoPago: 'bancard',
    comprobanteRef: 'Meta Ads #9021',
    creadoEn: getOffsetDateStr(-1),
  },
];
