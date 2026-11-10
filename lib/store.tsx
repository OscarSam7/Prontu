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

    const nuevoId = `PYM-2026-${String(reservas.length + 1).padStart(3, '0')}`;
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
    return nuevaReserva;
  };

  const actualizarEstadoReserva = (id: string, nuevoEstado: EstadoReserva) => {
    setReservas((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          estado: nuevoEstado,
          saldoPendiente: nuevoEstado === 'Retirado' || nuevoEstado === 'Devuelto' ? 0 : r.saldoPendiente,
        };
      })
    );
  };

  const registrarDevolucion = (
    id: string,
    estadoDevolucion: EstadoDevolucion,
    itemsRotosIds: string[]
  ) => {
    setReservas((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        let descuento = 0;
        if (estadoDevolucion === 'Roto') {
          descuento = itemsRotosIds.reduce((acc, itemId) => {
            const found = PRECIOS_ROTURA.find((p) => p.id === itemId);
            return acc + (found ? found.precio : 0);
          }, 0);
        } else if (estadoDevolucion === 'Sucio') {
          descuento = 80000; // Tasa limpieza profunda
        }
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
  };

  const toggleDisponibilidadKit = (kitId: number) => {
    setKits((prev) =>
      prev.map((k) => (k.id === kitId ? { ...k, disponible: !k.disponible } : k))
    );
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
