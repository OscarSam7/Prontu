'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  KITS,
  Kit,
  RESERVAS_EJEMPLO,
  Reserva,
  COSTO_DELIVERY_CDE,
  COSTO_UPSELL_SONIDO_CASA,
  EstadoReserva,
  EstadoDevolucion,
  PRECIOS_ROTURA,
} from './kits';
import { supabase, isSupabaseConfigured } from './supabase';

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
    comprobanteNombre?: string
  ) => Reserva;
  actualizarEstadoReserva: (id: string, nuevoEstado: EstadoReserva) => void;
  registrarDevolucion: (
    id: string,
    estadoDevolucion: EstadoDevolucion,
    itemsRotosIds: string[]
  ) => void;
  toggleDisponibilidadKit: (kitId: number) => void;
  actualizarPrecioKit: (kitId: number, precioPublico: number, precioDecoradora: number) => void;
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

const reservaToRow = (r: Reserva) => ({
  id: r.id,
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
  estado: r.estado,
  estado_devolucion: r.estadoDevolucion ?? null,
  items_rotos: r.itemsRotos ?? [],
  descuento_garantia: r.descuentoGarantia ?? 0,
  garantia_devuelta: r.garantiaDevuelta ?? 0,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rowToReserva = (row: any): Reserva => ({
  id: row.id,
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
  estado: row.estado,
  estadoDevolucion: row.estado_devolucion ?? undefined,
  itemsRotos: row.items_rotos ?? [],
  descuentoGarantia: row.descuento_garantia ?? 0,
  garantiaDevuelta: row.garantia_devuelta ?? 0,
  creadoEn: row.created_at ? String(row.created_at).split('T')[0] : new Date().toISOString().split('T')[0],
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [kits, setKits] = useState<Kit[]>(KITS);
  const [reservas, setReservas] = useState<Reserva[]>(RESERVAS_EJEMPLO);
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
    } catch (e) {
      console.error('Error cargando estado local:', e);
    }
    setHydrated(true);

    if (isSupabaseConfigured()) {
      (async () => {
        try {
          const { data: kitsData, error: kitsErr } = await supabase
            .from('kits')
            .select('id, disponible, precio_publico, precio_decoradora');

          if (!kitsErr && kitsData) {
            if (kitsData.length === 0) {
              await supabase.from('kits').upsert(
                KITS.map((k) => ({
                  id: k.id,
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
                  rating: k.rating,
                  resenas: k.reseñas,
                  disponible: k.disponible,
                }))
              );
            } else {
              setKits((prev) =>
                prev.map((k) => {
                  const remote = kitsData.find((rk) => rk.id === k.id);
                  return remote
                    ? {
                        ...k,
                        disponible: remote.disponible,
                        precioPublico: remote.precio_publico,
                        precioDecoradora: remote.precio_decoradora,
                      }
                    : k;
                })
              );
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

  const confirmarReservaYPago = (
    metodoPago: 'transferencia' | 'bancard' | 'pix',
    comprobanteNombre?: string
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
        actualizarEstadoReserva,
        registrarDevolucion,
        toggleDisponibilidadKit,
        actualizarPrecioKit,
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
