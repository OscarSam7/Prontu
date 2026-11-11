export type PlanSaaS = 'basico' | 'pro' | 'marca_blanca';
export type EstadoSuscripcion = 'prueba' | 'activo' | 'suspendido';

export interface PlanConfig {
  id: PlanSaaS;
  nombre: string;
  precioMensual: number;
  limiteKits: number | null; // null = ilimitados
  descripcion: string;
}

export const PLANES_SAAS: Record<PlanSaaS, PlanConfig> = {
  basico: {
    id: 'basico',
    nombre: 'Plan Básico',
    precioMensual: 150000,
    limiteKits: 25,
    descripcion: 'Hasta 25 kits, calendario anti-doble reserva, seña 50% y QR.',
  },
  pro: {
    id: 'pro',
    nombre: 'Plan Pro Decoradoras',
    precioMensual: 280000,
    limiteKits: null,
    descripcion: 'Kits ilimitados, Modo Decoradora, tutoriales y control de roturas.',
  },
  marca_blanca: {
    id: 'marca_blanca',
    nombre: 'Plan Marca Blanca',
    precioMensual: 450000,
    limiteKits: null,
    descripcion: 'Todo lo Pro + dominio propio y soporte prioritario.',
  },
};

export interface Negocio {
  id: string;
  slug: string;
  nombre: string;
  ciudad: string;
  duenoNombre: string;
  whatsapp: string;
  aliasSipap: string;
  colorPrimario: string;
  logoUrl?: string;
  portadaUrl?: string;
  qrPagoUrl?: string;
  plan: PlanSaaS;
  precioMensual: number;
  estado: EstadoSuscripcion;
  fechaVencimiento: string; // YYYY-MM-DD
  emailAdmin: string;
  pinAdmin: string;
  creadoEn: string;
}

export interface PagoSuscripcion {
  id: string;
  negocioId: string;
  negocioNombre: string;
  plan: PlanSaaS;
  monto: number;
  periodo: string; // YYYY-MM
  metodo: 'transferencia' | 'bancard' | 'pix' | 'efectivo';
  fechaPago: string;
}

export interface SaasConfig {
  whatsappSoporte: string;
  textoBotonWhatsapp: string;
  mensajeSoporte: string;
  aliasCobroSaaS: string;
  tituloVenta: string;
  subtituloVenta: string;
}

export const SAAS_CONFIG_DEFAULT: SaasConfig = {
  whatsappSoporte: '0983 637 780',
  textoBotonWhatsapp: '¿Tenés dudas? Escribinos por WhatsApp',
  mensajeSoporte: 'Hola! Quiero consultar por el sistema Pegue y Monte',
  aliasCobroSaaS: '3233591',
  tituloVenta:
    'Tené tu propia App Web de Pegue y Monte y Audiovisual en 1 minuto',
  subtituloVenta:
    'Dejá de responder precios uno por uno por WhatsApp. Tus clientes ven tus kits, eligen fecha en calendario, pagan la seña del 50% y reciben su código QR automáticamente.',
};

const addDays = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const slugifyNegocio = (texto: string): string =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const NEGOCIOS_INICIALES: Negocio[] = [
  {
    id: 'neg-pegue-y-monte-cde',
    slug: 'pegue-y-monte-cde',
    nombre: 'Pegue y Monte CDE',
    ciudad: 'Ciudad del Este - Paraguay',
    duenoNombre: 'Casa Matriz (Fundador)',
    whatsapp: '0983 637 780',
    aliasSipap: '3233591',
    colorPrimario: '#FF4D7A',
    plan: 'marca_blanca',
    precioMensual: 450000,
    estado: 'activo',
    fechaVencimiento: addDays(365),
    emailAdmin: 'pegueymontecde@gmail.com',
    pinAdmin: '2026',
    creadoEn: addDays(-30),
  },
  {
    id: 'neg-fiestas-asu',
    slug: 'fiestas-magicas-asu',
    nombre: 'Fiestas Mágicas Asunción',
    ciudad: 'Asunción - Paraguay',
    duenoNombre: 'Camila Mendoza',
    whatsapp: '0981 555 210',
    aliasSipap: '4120988',
    colorPrimario: '#7C3AED',
    plan: 'pro',
    precioMensual: 280000,
    estado: 'activo',
    fechaVencimiento: addDays(18),
    emailAdmin: 'camila.fiestas@gmail.com',
    pinAdmin: '1234',
    creadoEn: addDays(-12),
  },
  {
    id: 'neg-encanto-encarnacion',
    slug: 'encanto-eventos-encarnacion',
    nombre: 'Encanto Eventos Encarnación',
    ciudad: 'Encarnación - Itapúa',
    duenoNombre: 'Marcos Acuña',
    whatsapp: '0975 330 890',
    aliasSipap: '0975330890',
    colorPrimario: '#1FA8A0',
    plan: 'basico',
    precioMensual: 150000,
    estado: 'prueba',
    fechaVencimiento: addDays(7),
    emailAdmin: 'encantoeventos.py@gmail.com',
    pinAdmin: '2026',
    creadoEn: addDays(-7),
  },
];

export const PAGOS_SUSCRIPCION_INICIALES: PagoSuscripcion[] = [
  {
    id: 'SUS-2026-001',
    negocioId: 'neg-fiestas-asu',
    negocioNombre: 'Fiestas Mágicas Asunción',
    plan: 'pro',
    monto: 280000,
    periodo: new Date().toISOString().slice(0, 7),
    metodo: 'transferencia',
    fechaPago: addDays(-12),
  },
];
