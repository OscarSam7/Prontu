'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  KITS,
  Kit,
  CategoriaFiltro,
  RESERVAS_EJEMPLO,
  Reserva,
  COSTO_DELIVERY_CDE,
  COSTO_UPSELL_SONIDO_CASA,
  EstadoReserva,
  EstadoDevolucion,
  PRECIOS_ROTURA,
  DEFAULT_NEGOCIO_ID,
} from './kits';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  Negocio,
  PagoSuscripcion,
  PlanSaaS,
  EstadoSuscripcion,
  PLANES_SAAS,
  NEGOCIOS_INICIALES,
  PAGOS_SUSCRIPCION_INICIALES,
  slugifyNegocio,
} from './saas';

export interface DraftReserva {
  kitId: number;
  fechaRetiro: string;
  fechaDevolucion: string;
  agregaSonidoCasa: boolean;
  modalidadEntrega: 'retiro' | 'delivery';
  clienteNombre: string;
  clienteCi: string;
  clienteWhatsapp: string;
  direccionFiesta: string;
  aceptaContrato: boolean;
}

interface AppContextType {
  kits: Kit[];
  reservas: Reserva[];
  esDecoradora: boolean;
  toggleDecoradora: () => void;
  setEsDecoradora: (val: boolean) => void;
  draft: DraftReserva;
  updateDraft: (partial: Partial<DraftReserva>) => void;
   confirmarReservaYPago: (
    metodoPago: 'transferencia' | 'bancard' | 'pix',
    comprobanteNombre?: string,
    negocioId?: string,
    comprobanteUrl?: string
  ) => Reserva;
  getKitsByNegocio: (negocioId?: string) => Kit[];
  getReservasByNegocio: (negocioId?: string) => Reserva[];
  actualizarEstadoReserva: (id: string, nuevoEstado: EstadoReserva) => void;
  registrarDevolucion: (
    id: string,
    estadoDevolucion: EstadoDevolucion,
    itemsRotosIds: string[]
  ) => void;
  toggleDisponibilidadKit: (kitId: number) => void;
  actualizarPrecioKit: (kitId: number, precioPublico: number, precioDecoradora: number) => void;
  agregarKit: (nuevo: Omit<Kit, 'id' | 'tags' | 'rating' | 'reseñas'>) => Kit;
  editarKit: (kitActualizado: Omit<Kit, 'tags'> & { tags?: CategoriaFiltro[] }) => void;
  eliminarKit: (kitId: number) => { ok: boolean; error?: string };
  negocios: Negocio[];
  pagosSuscripcion: PagoSuscripcion[];
  crearNegocio: (datos: {
    nombre: string;
    slug?: string;
    ciudad: string;
    duenoNombre: string;
    whatsapp: string;
    aliasSipap: string;
    colorPrimario: string;
    plan: PlanSaaS;
    estado: EstadoSuscripcion;
    emailAdmin: string;
    pinAdmin: string;
  }) => Negocio;
  actualizarNegocio: (negocio: Negocio) => void;
  cambiarEstadoNegocio: (id: string, estado: EstadoSuscripcion) => void;
  registrarPagoSuscripcion: (
    negocioId: string,
    metodo: 'transferencia' | 'bancard' | 'pix' | 'efectivo'
  ) => void;
  recuperarPinNegocio: (
    negocioId: string,
    email: string,
    whatsapp: string,
    nuevoPin: string
  ) => { ok: boolean; error?: string };
  eliminarNegocio: (id: string) => void;
  esFechaOcupada: (kitId: number, dateStr: string) => boolean;
  rangoTieneConflicto: (kitId: number, inicio: string, fin: string) => boolean;
}

const getTomorrow = (offset = 1): string => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const defaultDraft: DraftReserva = {
  kitId: 1,
  fechaRetiro: getTomorrow(2),
  fechaDevolucion: getTomorrow(3),
  agregaSonidoCasa: false,
  modalidadEntrega: 'retiro',
  clienteNombre: '',
  clienteCi: '',
  clienteWhatsapp: '',
  direccionFiesta: '',
  aceptaContrato: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const buildTagsForKit = (
  categoria: string,
  grupo: 'Deco' | 'Audiovisual'
): CategoriaFiltro[] => {
  const validFilters: CategoriaFiltro[] = [
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
  const tags = new Set<CategoriaFiltro>(['Todos']);
  if (grupo === 'Deco') tags.add('Deco');
  if (categoria === 'Combo Total') {
    tags.add('Combo Total');
    tags.add('Deco');
    tags.add('Sonido');
    tags.add('Luces');
    tags.add('Pantallas');
  } else if (validFilters.includes(categoria as CategoriaFiltro)) {
    tags.add(categoria as CategoriaFiltro);
  }
  return Array.from(tags);
};

const kitToRow = (k: Kit) => ({
  id: k.id,
  negocio_id: k.negocioId || DEFAULT_NEGOCIO_ID,
  nombre: k.nombre,
  categoria: k.categoria,
  subcategoria: k.grupo,
  precio_publico: k.precioPublico,
  precio_decoradora: k.precioDecoradora,
  garantia: k.garantia,
  descripcion: k.descripcion,
  incluye: k.incluye,
  no_incluye: k.noIncluye,
  fotos: k.fotos,
  video_url: k.videoUrl,
  pasos_montaje: k.pasosMontaje ?? [],
  tiempo_armado: k.tiempoArmado ?? null,
  medidas_transporte: k.medidasTransporte ?? null,
  rating: k.rating,
  resenas: k.reseñas,
  disponible: k.disponible,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rowToKit = (row: any): Kit => {
  const grupo: 'Deco' | 'Audiovisual' =
    row.subcategoria === 'Audiovisual' ? 'Audiovisual' : 'Deco';
  const baseMatch = KITS.find((k) => k.id === row.id);
  const sameCategory =
    baseMatch && baseMatch.categoria === row.categoria && baseMatch.grupo === grupo;

  return {
    id: row.id,
    negocioId: row.negocio_id || DEFAULT_NEGOCIO_ID,
    nombre: row.nombre,
    categoria: row.categoria,
    grupo,
    tags: sameCategory
      ? baseMatch.tags
      : buildTagsForKit(row.categoria, grupo),
    precioPublico: row.precio_publico,
    precioDecoradora: row.precio_decoradora,
    garantia: row.garantia,
    descripcion: row.descripcion,
    incluye: Array.isArray(row.incluye) ? row.incluye : [],
    noIncluye: Array.isArray(row.no_incluye) ? row.no_incluye : [],
    fotos: Array.isArray(row.fotos) && row.fotos.length > 0 ? row.fotos : KITS[0].fotos,
    videoUrl: row.video_url || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pasosMontaje: Array.isArray(row.pasos_montaje) ? row.pasos_montaje : undefined,
    tiempoArmado: row.tiempo_armado ?? undefined,
    medidasTransporte: row.medidas_transporte ?? undefined,
    rating: Number(row.rating ?? 5.0),
    reseñas: Number(row.resenas ?? 0),
    disponible: row.disponible !== false,
  };
};

const reservaToRow = (r: Reserva) => ({
  id: r.id,
  negocio_id: r.negocioId || DEFAULT_NEGOCIO_ID,
  kit_id: r.kitId,
  kit_nombre: r.kitNombre,
  cliente_nombre: r.clienteNombre,
  cliente_ci: r.clienteCi,
  cliente_whatsapp: r.clienteWhatsapp,
  direccion_fiesta: r.direccionFiesta,
  modalidad_entrega: r.modalidadEntrega,
  costo_delivery: r.costoDelivery,
  agrega_sonido_casa: r.agregaSonidoCasa,
  costo_upsell: r.costoUpsell,
  es_tarifa_decoradora: r.esDecoradora,
  fecha_retiro: r.fechaRetiro,
  fecha_devolucion: r.fechaDevolucion,
  precio_total: r.precioTotal,
  sena_50: r.sena50,
  saldo_pendiente: r.saldoPendiente,
  garantia: r.garantia,
  metodo_pago: r.metodoPago,
  comprobante_nombre: r.comprobanteNombre ?? null,
  comprobante_url: r.comprobanteUrl ?? null,
  estado: r.estado,
  estado_devolucion: r.estadoDevolucion ?? null,
  items_rotos: r.itemsRotos ?? [],
  descuento_garantia: r.descuentoGarantia ?? 0,
  garantia_devuelta: r.garantiaDevuelta ?? 0,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rowToReserva = (row: any): Reserva => ({
  id: row.id,
  negocioId: row.negocio_id || DEFAULT_NEGOCIO_ID,
  kitId: row.kit_id,
  kitNombre: row.kit_nombre,
  clienteNombre: row.cliente_nombre,
  clienteCi: row.cliente_ci,
  clienteWhatsapp: row.cliente_whatsapp,
  direccionFiesta: row.direccion_fiesta,
  modalidadEntrega: row.modalidad_entrega,
  costoDelivery: row.costo_delivery,
  agregaSonidoCasa: Boolean(row.agrega_sonido_casa),
  costoUpsell: row.costo_upsell,
  esDecoradora: Boolean(row.es_tarifa_decoradora),
  fechaRetiro: row.fecha_retiro,
  fechaDevolucion: row.fecha_devolucion,
  precioTotal: row.precio_total,
  sena50: row.sena_50,
  saldoPendiente: row.saldo_pendiente,
  garantia: row.garantia,
  metodoPago: row.metodo_pago,
  comprobanteNombre: row.comprobante_nombre ?? undefined,
  comprobanteUrl: row.comprobante_url ?? undefined,
  estado: row.estado,
  estadoDevolucion: row.estado_devolucion ?? undefined,
  itemsRotos: row.items_rotos ?? [],
  descuentoGarantia: row.descuento_garantia ?? 0,
  garantiaDevuelta: row.garantia_devuelta ?? 0,
  creadoEn: row.created_at ? String(row.created_at).split('T')[0] : new Date().toISOString().split('T')[0],
});

const negocioToRow = (n: Negocio) => ({
  id: n.id,
  slug: n.slug,
  nombre: n.nombre,
  ciudad: n.ciudad,
  dueno_nombre: n.duenoNombre,
  whatsapp: n.whatsapp,
  alias_sipap: n.aliasSipap,
  color_primario: n.colorPrimario,
  logo_url: n.logoUrl ?? null,
  portada_url: n.portadaUrl ?? null,
  qr_pago_url: n.qrPagoUrl ?? null,
  plan: n.plan,
  precio_mensual: n.precioMensual,
  estado: n.estado,
  fecha_vencimiento: n.fechaVencimiento,
  email_admin: n.emailAdmin,
  pin_admin: n.pinAdmin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rowToNegocio = (row: any): Negocio => ({
  id: row.id,
  slug: row.slug,
  nombre: row.nombre,
  ciudad: row.ciudad,
  duenoNombre: row.dueno_nombre || 'Propietario',
  whatsapp: row.whatsapp,
  aliasSipap: row.alias_sipap || '',
  colorPrimario: row.color_primario || '#FF4D7A',
  logoUrl: row.logo_url ?? undefined,
  portadaUrl: row.portada_url ?? undefined,
  qrPagoUrl: row.qr_pago_url ?? undefined,
  plan: row.plan,
  precioMensual: row.precio_mensual,
  estado: row.estado,
  fechaVencimiento: row.fecha_vencimiento,
  emailAdmin: row.email_admin || 'pegueymontecde@gmail.com',
  pinAdmin: row.pin_admin || '2026',
  creadoEn: row.created_at
    ? String(row.created_at).split('T')[0]
    : new Date().toISOString().split('T')[0],
});

const pagoSusToRow = (p: PagoSuscripcion) => ({
  id: p.id,
  negocio_id: p.negocioId,
  negocio_nombre: p.negocioNombre,
  plan: p.plan,
  monto: p.monto,
  periodo: p.periodo,
  metodo: p.metodo,
  fecha_pago: p.fechaPago,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rowToPagoSus = (row: any): PagoSuscripcion => ({
  id: row.id,
  negocioId: row.negocio_id,
  negocioNombre: row.negocio_nombre,
  plan: row.plan,
  monto: row.monto,
  periodo: row.periodo,
  metodo: row.metodo || 'transferencia',
  fechaPago: row.fecha_pago,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [kits, setKits] = useState<Kit[]>(KITS);
  const [reservas, setReservas] = useState<Reserva[]>(RESERVAS_EJEMPLO);
  const [negocios, setNegocios] = useState<Negocio[]>(NEGOCIOS_INICIALES);
  const [pagosSuscripcion, setPagosSuscripcion] = useState<PagoSuscripcion[]>(
    PAGOS_SUSCRIPCION_INICIALES
  );
  const [esDecoradora, setEsDecoradoraState] = useState<boolean>(false);
  const [draft, setDraft] = useState<DraftReserva>(defaultDraft);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedDeco = localStorage.getItem('pym_es_decoradora');
      if (savedDeco !== null) {
        setEsDecoradoraState(JSON.parse(savedDeco));
      }
      const savedReservas = localStorage.getItem('pym_reservas');
      if (savedReservas) {
        setReservas(JSON.parse(savedReservas));
      }
      const savedDraft = localStorage.getItem('pym_draft');
      if (savedDraft) {
        setDraft(JSON.parse(savedDraft));
      }
      const savedKits = localStorage.getItem('pym_kits');
      if (savedKits) {
        setKits(JSON.parse(savedKits));
      }
      const savedNegocios = localStorage.getItem('pym_negocios');
      if (savedNegocios) {
        setNegocios(JSON.parse(savedNegocios));
      }
      const savedPagosSus = localStorage.getItem('pym_pagos_suscripcion');
      if (savedPagosSus) {
        setPagosSuscripcion(JSON.parse(savedPagosSus));
      }
    } catch (e) {
      console.error('Error cargando estado local:', e);
    }
    setHydrated(true);

    if (isSupabaseConfigured()) {
      (async () => {
        try {
          const { data: kitsData, error: kitsErr } = await supabase
            .from('kits')
            .select('*')
            .order('id', { ascending: true });

          if (!kitsErr && kitsData) {
            if (kitsData.length === 0) {
              await supabase.from('kits').upsert(KITS.map(kitToRow));
            } else {
              setKits(kitsData.map(rowToKit));
            }
          }

          const { data: resData, error: resErr } = await supabase
            .from('reservas')
            .select('*')
            .order('created_at', { ascending: false });

          if (!resErr && resData) {
            if (resData.length === 0) {
              await supabase.from('reservas').upsert(RESERVAS_EJEMPLO.map(reservaToRow));
            } else {
              setReservas(resData.map(rowToReserva));
            }
          }

          const { data: negData, error: negErr } = await supabase
            .from('negocios')
            .select('*')
            .order('created_at', { ascending: true });

          if (!negErr && negData) {
            if (negData.length <= 1) {
              await supabase.from('negocios').upsert(NEGOCIOS_INICIALES.map(negocioToRow));
            } else {
              setNegocios(negData.map(rowToNegocio));
            }
          }

          const { data: pagSusData, error: pagSusErr } = await supabase
            .from('pagos_suscripcion')
            .select('*')
            .order('created_at', { ascending: false });

          if (!pagSusErr && pagSusData && pagSusData.length > 0) {
            setPagosSuscripcion(pagSusData.map(rowToPagoSus));
          }
        } catch (err) {
          console.error('Error sincronizando con Supabase:', err);
        }
      })();
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('pym_es_decoradora', JSON.stringify(esDecoradora));
  }, [esDecoradora, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('pym_reservas', JSON.stringify(reservas));
  }, [reservas, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('pym_draft', JSON.stringify(draft));
  }, [draft, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('pym_kits', JSON.stringify(kits));
  }, [kits, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('pym_negocios', JSON.stringify(negocios));
  }, [negocios, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('pym_pagos_suscripcion', JSON.stringify(pagosSuscripcion));
  }, [pagosSuscripcion, hydrated]);

  // Registrar Service Worker PWA
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  const toggleDecoradora = () => {
    setEsDecoradoraState((prev) => !prev);
  };

  const setEsDecoradora = (val: boolean) => {
    setEsDecoradoraState(val);
  };

  const updateDraft = (partial: Partial<DraftReserva>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  };

  // Verifica si una fecha YYYY-MM-DD ya está reservada para ese kit
  const esFechaOcupada = (kitId: number, dateStr: string): boolean => {
    const kit = kits.find((k) => k.id === kitId);
    if (kit && !kit.disponible) return true;

    return reservas.some((r) => {
      if (r.kitId !== kitId) return false;
      if (r.estado === 'Devuelto') return false;
      return dateStr >= r.fechaRetiro && dateStr <= r.fechaDevolucion;
    });
  };

  const rangoTieneConflicto = (kitId: number, inicio: string, fin: string): boolean => {
    if (!inicio || !fin) return false;
    return reservas.some((r) => {
      if (r.kitId !== kitId) return false;
      if (r.estado === 'Devuelto') return false;
      return inicio <= r.fechaDevolucion && fin >= r.fechaRetiro;
    });
  };

  const getKitsByNegocio = (negocioId = DEFAULT_NEGOCIO_ID): Kit[] => {
    const propios = kits.filter(
      (k) => (k.negocioId || DEFAULT_NEGOCIO_ID) === negocioId
    );
    if (negocioId !== DEFAULT_NEGOCIO_ID && propios.length === 0) {
      // Para tiendas demo previas que aún no clonaron kits propios
      return kits
        .filter((k) => (k.negocioId || DEFAULT_NEGOCIO_ID) === DEFAULT_NEGOCIO_ID)
        .slice(0, 6);
    }
    return propios;
  };

  const getReservasByNegocio = (negocioId = DEFAULT_NEGOCIO_ID): Reserva[] => {
    return reservas.filter(
      (r) => (r.negocioId || DEFAULT_NEGOCIO_ID) === negocioId
    );
  };

  const confirmarReservaYPago = (
    metodoPago: 'transferencia' | 'bancard' | 'pix',
    comprobanteNombre?: string,
    negocioId = DEFAULT_NEGOCIO_ID,
    comprobanteUrl?: string
  ): Reserva => {
    const kit = kits.find((k) => k.id === draft.kitId) || kits[0];
    const precioBase = esDecoradora ? kit.precioDecoradora : kit.precioPublico;
    const costoUpsell = draft.agregaSonidoCasa ? COSTO_UPSELL_SONIDO_CASA : 0;
    const costoDelivery = draft.modalidadEntrega === 'delivery' ? COSTO_DELIVERY_CDE : 0;
    const precioTotal = precioBase + costoUpsell + costoDelivery;
    const sena50 = Math.round(precioTotal * 0.5);
    const saldoPendiente = precioTotal - sena50;

    const nuevoId = `PYM-2026-${String(reservas.length + 1).padStart(3, '0')}-${Math.floor(
      100 + Math.random() * 900
    )}`;
    const hoy = new Date().toISOString().split('T')[0];

    const nuevaReserva: Reserva = {
      id: nuevoId,
      negocioId,
      kitId: kit.id,
      kitNombre: kit.nombre,
      clienteNombre: draft.clienteNombre || 'Cliente Pegue y Monte',
      clienteCi: draft.clienteCi || '4.000.000',
      clienteWhatsapp: draft.clienteWhatsapp || '0983 000 000',
      direccionFiesta: draft.direccionFiesta || 'Ciudad del Este',
      modalidadEntrega: draft.modalidadEntrega,
      costoDelivery,
      agregaSonidoCasa: draft.agregaSonidoCasa,
      costoUpsell,
      esDecoradora,
      fechaRetiro: draft.fechaRetiro,
      fechaDevolucion: draft.fechaDevolucion,
      precioTotal,
      sena50,
      saldoPendiente,
      garantia: kit.garantia,
      metodoPago,
      comprobanteNombre,
      comprobanteUrl,
      estado: 'Pagó 50%',
      creadoEn: hoy,
    };

    setReservas((prev) => [nuevaReserva, ...prev]);

    if (isSupabaseConfigured()) {
      supabase.from('reservas').insert(reservaToRow(nuevaReserva)).then(({ error }) => {
        if (error) console.error('Error guardando reserva en Supabase:', error);
      });
    }

    return nuevaReserva;
  };

  const actualizarEstadoReserva = (id: string, nuevoEstado: EstadoReserva) => {
    const target = reservas.find((r) => r.id === id);
    const nuevoSaldo =
      nuevoEstado === 'Retirado' || nuevoEstado === 'Devuelto'
        ? 0
        : target?.saldoPendiente ?? 0;

    setReservas((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          estado: nuevoEstado,
          saldoPendiente: nuevoSaldo,
        };
      })
    );

    if (isSupabaseConfigured()) {
      supabase
        .from('reservas')
        .update({ estado: nuevoEstado, saldo_pendiente: nuevoSaldo })
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Error actualizando estado en Supabase:', error);
        });
    }
  };

  const registrarDevolucion = (
    id: string,
    estadoDevolucion: EstadoDevolucion,
    itemsRotosIds: string[]
  ) => {
    let descuento = 0;
    if (estadoDevolucion === 'Roto') {
      descuento = itemsRotosIds.reduce((acc, itemId) => {
        const found = PRECIOS_ROTURA.find((p) => p.id === itemId);
        return acc + (found ? found.precio : 0);
      }, 0);
    } else if (estadoDevolucion === 'Sucio') {
      descuento = 80000; // Tasa limpieza profunda
    }

    const target = reservas.find((r) => r.id === id);
    const garantiaDevueltaCalc = Math.max(0, (target?.garantia ?? 0) - descuento);

    setReservas((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const garantiaDevuelta = Math.max(0, r.garantia - descuento);
        return {
          ...r,
          estado: 'Devuelto',
          saldoPendiente: 0,
          estadoDevolucion,
          itemsRotos: itemsRotosIds,
          descuentoGarantia: descuento,
          garantiaDevuelta,
        };
      })
    );

    if (isSupabaseConfigured()) {
      supabase
        .from('reservas')
        .update({
          estado: 'Devuelto',
          saldo_pendiente: 0,
          estado_devolucion: estadoDevolucion,
          items_rotos: itemsRotosIds,
          descuento_garantia: descuento,
          garantia_devuelta: garantiaDevueltaCalc,
        })
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Error registrando devolución en Supabase:', error);
        });
    }
  };

  const toggleDisponibilidadKit = (kitId: number) => {
    const currentKit = kits.find((k) => k.id === kitId);
    const nuevoDisponible = currentKit ? !currentKit.disponible : true;

    setKits((prev) =>
      prev.map((k) => (k.id === kitId ? { ...k, disponible: nuevoDisponible } : k))
    );

    if (isSupabaseConfigured()) {
      supabase
        .from('kits')
        .update({ disponible: nuevoDisponible })
        .eq('id', kitId)
        .then(({ error }) => {
          if (error) console.error('Error actualizando kit en Supabase:', error);
        });
    }
  };

  const actualizarPrecioKit = (
    kitId: number,
    precioPublico: number,
    precioDecoradora: number
  ) => {
    setKits((prev) =>
      prev.map((k) =>
        k.id === kitId ? { ...k, precioPublico, precioDecoradora } : k
      )
    );

    if (isSupabaseConfigured()) {
      supabase
        .from('kits')
        .update({
          precio_publico: precioPublico,
          precio_decoradora: precioDecoradora,
        })
        .eq('id', kitId)
        .then(({ error }) => {
          if (error) console.error('Error actualizando precios en Supabase:', error);
        });
    }
  };

  const agregarKit = (
    nuevo: Omit<Kit, 'id' | 'tags' | 'rating' | 'reseñas'>
  ): Kit => {
    const maxId = kits.reduce((max, k) => (k.id > max ? k.id : max), 0);
    const kitCreado: Kit = {
      ...nuevo,
      id: maxId + 1,
      tags: buildTagsForKit(nuevo.categoria, nuevo.grupo),
      rating: 5.0,
      reseñas: 0,
    };

    setKits((prev) => [kitCreado, ...prev]);

    if (isSupabaseConfigured()) {
      supabase
        .from('kits')
        .insert(kitToRow(kitCreado))
        .then(({ error }) => {
          if (error) console.error('Error agregando kit en Supabase:', error);
        });
    }

    return kitCreado;
  };

  const editarKit = (
    kitActualizado: Omit<Kit, 'tags'> & { tags?: CategoriaFiltro[] }
  ) => {
    const kitConTags: Kit = {
      ...kitActualizado,
      tags: buildTagsForKit(kitActualizado.categoria, kitActualizado.grupo),
    };

    setKits((prev) =>
      prev.map((k) => (k.id === kitConTags.id ? kitConTags : k))
    );

    if (isSupabaseConfigured()) {
      supabase
        .from('kits')
        .upsert(kitToRow(kitConTags))
        .then(({ error }) => {
          if (error) console.error('Error editando kit en Supabase:', error);
        });
    }
  };

  const eliminarKit = (kitId: number): { ok: boolean; error?: string } => {
    const tieneReservas = reservas.some((r) => r.kitId === kitId);
    if (tieneReservas) {
      return {
        ok: false,
        error:
          'Este kit tiene reservas asociadas en el historial. Usá "Desactivar" para ocultarlo de nuevas reservas sin perder el historial.',
      };
    }

    setKits((prev) => prev.filter((k) => k.id !== kitId));

    if (isSupabaseConfigured()) {
      supabase
        .from('kits')
        .delete()
        .eq('id', kitId)
        .then(({ error }) => {
          if (error) console.error('Error borrando kit en Supabase:', error);
        });
    }

    return { ok: true };
  };

  const crearNegocio = (datos: {
    nombre: string;
    slug?: string;
    ciudad: string;
    duenoNombre: string;
    whatsapp: string;
    aliasSipap: string;
    colorPrimario: string;
    plan: PlanSaaS;
    estado: EstadoSuscripcion;
    emailAdmin: string;
    pinAdmin: string;
  }): Negocio => {
    const baseSlug = slugifyNegocio(datos.slug || datos.nombre) || `tienda-${Date.now()}`;
    const existeSlug = negocios.some((n) => n.slug === baseSlug);
    const slugFinal = existeSlug ? `${baseSlug}-${Math.floor(10 + Math.random() * 90)}` : baseSlug;

    const diasIniciales = datos.estado === 'prueba' ? 14 : 30;
    const venc = new Date();
    venc.setDate(venc.getDate() + diasIniciales);

    const nuevo: Negocio = {
      id: `neg-${slugFinal}`,
      slug: slugFinal,
      nombre: datos.nombre.trim(),
      ciudad: datos.ciudad.trim() || 'Paraguay',
      duenoNombre: datos.duenoNombre.trim() || 'Propietario',
      whatsapp: datos.whatsapp.trim(),
      aliasSipap: datos.aliasSipap.trim(),
      colorPrimario: datos.colorPrimario || '#FF4D7A',
      plan: datos.plan,
      precioMensual: PLANES_SAAS[datos.plan].precioMensual,
      estado: datos.estado,
      fechaVencimiento: venc.toISOString().split('T')[0],
      emailAdmin: datos.emailAdmin.trim().toLowerCase(),
      pinAdmin: datos.pinAdmin.trim() || '2026',
      creadoEn: new Date().toISOString().split('T')[0],
    };

    setNegocios((prev) => [nuevo, ...prev]);

    // Clonar 3 kits iniciales propios para que la tienda suscriptora no arranque vacía
    const maxId = kits.reduce((max, k) => (k.id > max ? k.id : max), 0);
    const plantillas = [KITS[0], KITS[14], KITS[30]].filter(Boolean);
    const kitsSemilla: Kit[] = plantillas.map((tpl, idx) => ({
      ...tpl,
      id: maxId + idx + 1,
      negocioId: nuevo.id,
      reseñas: 0,
    }));
    setKits((prev) => [...kitsSemilla, ...prev]);

    if (isSupabaseConfigured()) {
      supabase.from('negocios').insert(negocioToRow(nuevo)).then(({ error }) => {
        if (error) console.error('Error creando negocio en Supabase:', error);
      });
      supabase.from('kits').insert(kitsSemilla.map(kitToRow)).then(({ error }) => {
        if (error) console.error('Error clonando kits iniciales en Supabase:', error);
      });
    }

    return nuevo;
  };

  const actualizarNegocio = (negocioActualizado: Negocio) => {
    const actualizado: Negocio = {
      ...negocioActualizado,
      precioMensual: PLANES_SAAS[negocioActualizado.plan].precioMensual,
    };

    setNegocios((prev) =>
      prev.map((n) => (n.id === actualizado.id ? actualizado : n))
    );

    if (isSupabaseConfigured()) {
      supabase.from('negocios').upsert(negocioToRow(actualizado)).then(({ error }) => {
        if (error) console.error('Error actualizando negocio en Supabase:', error);
      });
    }
  };

  const cambiarEstadoNegocio = (id: string, estado: EstadoSuscripcion) => {
    setNegocios((prev) =>
      prev.map((n) => (n.id === id ? { ...n, estado } : n))
    );

    if (isSupabaseConfigured()) {
      supabase
        .from('negocios')
        .update({ estado })
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Error cambiando estado en Supabase:', error);
        });
    }
  };

  const registrarPagoSuscripcion = (
    negocioId: string,
    metodo: 'transferencia' | 'bancard' | 'pix' | 'efectivo'
  ) => {
    const neg = negocios.find((n) => n.id === negocioId);
    if (!neg) return;

    const hoy = new Date();
    const baseFecha =
      neg.fechaVencimiento > hoy.toISOString().split('T')[0]
        ? new Date(neg.fechaVencimiento)
        : hoy;
    baseFecha.setDate(baseFecha.getDate() + 30);
    const nuevoVencimiento = baseFecha.toISOString().split('T')[0];

    const pago: PagoSuscripcion = {
      id: `SUS-${Date.now().toString().slice(-6)}`,
      negocioId: neg.id,
      negocioNombre: neg.nombre,
      plan: neg.plan,
      monto: neg.precioMensual,
      periodo: hoy.toISOString().slice(0, 7),
      metodo,
      fechaPago: hoy.toISOString().split('T')[0],
    };

    setNegocios((prev) =>
      prev.map((n) =>
        n.id === negocioId
          ? { ...n, estado: 'activo', fechaVencimiento: nuevoVencimiento }
          : n
      )
    );
    setPagosSuscripcion((prev) => [pago, ...prev]);

    if (isSupabaseConfigured()) {
      supabase
        .from('negocios')
        .update({ estado: 'activo', fecha_vencimiento: nuevoVencimiento })
        .eq('id', negocioId)
        .then(({ error }) => {
          if (error) console.error('Error renovando negocio en Supabase:', error);
        });
      supabase.from('pagos_suscripcion').insert(pagoSusToRow(pago)).then(({ error }) => {
        if (error) console.error('Error guardando pago en Supabase:', error);
      });
    }
  };

  const recuperarPinNegocio = (
    negocioId: string,
    email: string,
    whatsapp: string,
    nuevoPin: string
  ): { ok: boolean; error?: string } => {
    const neg = negocios.find((n) => n.id === negocioId);
    if (!neg) return { ok: false, error: 'Tienda no encontrada.' };

    const cleanEmail = email.trim().toLowerCase();
    const expectedEmail = (neg.emailAdmin || '').trim().toLowerCase();
    const digitsInput = whatsapp.replace(/\D/g, '').replace(/^595/, '0');
    const digitsExpected = neg.whatsapp.replace(/\D/g, '').replace(/^595/, '0');

    if (!cleanEmail || cleanEmail !== expectedEmail) {
      return {
        ok: false,
        error: 'El correo Gmail no coincide con el registrado en esta tienda.',
      };
    }

    if (!digitsInput || digitsInput.slice(-6) !== digitsExpected.slice(-6)) {
      return {
        ok: false,
        error: 'El número de WhatsApp no coincide con el registrado en esta tienda.',
      };
    }

    const pinFinal = nuevoPin.trim();
    if (pinFinal.length < 4) {
      return {
        ok: false,
        error: 'La nueva contraseña / PIN debe tener al menos 4 caracteres.',
      };
    }

    setNegocios((prev) =>
      prev.map((n) => (n.id === negocioId ? { ...n, pinAdmin: pinFinal } : n))
    );

    if (isSupabaseConfigured()) {
      supabase
        .from('negocios')
        .update({ pin_admin: pinFinal })
        .eq('id', negocioId)
        .then(({ error }) => {
          if (error) console.error('Error actualizando PIN en Supabase:', error);
        });
    }

    return { ok: true };
  };

  const eliminarNegocio = (id: string) => {
    setNegocios((prev) => prev.filter((n) => n.id !== id));
    if (isSupabaseConfigured()) {
      supabase
        .from('negocios')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Error borrando negocio en Supabase:', error);
        });
    }
  };

  return (
    <AppContext.Provider
      value={{
        kits,
        reservas,
        esDecoradora,
        toggleDecoradora,
        setEsDecoradora,
        draft,
        updateDraft,
        confirmarReservaYPago,
        getKitsByNegocio,
        getReservasByNegocio,
        actualizarEstadoReserva,
        registrarDevolucion,
        toggleDisponibilidadKit,
        actualizarPrecioKit,
        agregarKit,
        editarKit,
        eliminarKit,
        negocios,
        pagosSuscripcion,
        crearNegocio,
        actualizarNegocio,
        cambiarEstadoNegocio,
        registrarPagoSuscripcion,
        recuperarPinNegocio,
        eliminarNegocio,
        esFechaOcupada,
        rangoTieneConflicto,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de un AppProvider');
  }
  return context;
}
