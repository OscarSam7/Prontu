'use client';

import React from 'react';
import { ShieldCheck, Sparkles, Truck, Volume2 } from 'lucide-react';
import {
  formatGuaranies,
  COSTO_DELIVERY_CDE,
  COSTO_UPSELL_SONIDO_CASA,
} from '@/lib/kits';

interface PaymentSummaryProps {
  kitNombre: string;
  precioBase: number;
  precioOriginalPublico?: number;
  esDecoradora: boolean;
  agregaSonidoCasa: boolean;
  modalidadEntrega?: 'retiro' | 'delivery';
  garantia: number;
  mostrarDelivery?: boolean;
}

export default function PaymentSummary({
  kitNombre,
  precioBase,
  precioOriginalPublico,
  esDecoradora,
  agregaSonidoCasa,
  modalidadEntrega = 'retiro',
  garantia,
  mostrarDelivery = false,
}: PaymentSummaryProps) {
  const costoUpsell = agregaSonidoCasa ? COSTO_UPSELL_SONIDO_CASA : 0;
  const costoDelivery =
    mostrarDelivery && modalidadEntrega === 'delivery' ? COSTO_DELIVERY_CDE : 0;

  const precioTotal = precioBase + costoUpsell + costoDelivery;
  const hoyPagas50 = Math.round(precioTotal * 0.5);
  const saldoAlRetirar = precioTotal - hoyPagas50;
  const ahorroDecoradora =
    esDecoradora && precioOriginalPublico
      ? precioOriginalPublico - precioBase
      : 0;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-pink-100 space-y-3">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <h3 className="font-bold text-gray-900 text-base">
            Resumen de tu Reserva
          </h3>
          <p className="text-xs text-gray-500">Kit: {kitNombre}</p>
        </div>
        {esDecoradora && ahorroDecoradora > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-gold/15 text-amber-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
            Ahorrás {formatGuaranies(ahorroDecoradora)}
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-700">
          <span>
            Alquiler del Kit {esDecoradora ? '(Tarifa Decoradora)' : '(Público)'}
          </span>
          <span className="font-semibold">{formatGuaranies(precioBase)}</span>
        </div>

        {agregaSonidoCasa && (
          <div className="flex justify-between text-brand-teal font-medium">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4" />+ Upsell Sonido Fiesta Casa
            </span>
            <span>{formatGuaranies(COSTO_UPSELL_SONIDO_CASA)}</span>
          </div>
        )}

        {mostrarDelivery && (
          <div className="flex justify-between text-gray-700">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-brand-pink" />
              {modalidadEntrega === 'delivery'
                ? 'Delivery en Ciudad del Este'
                : 'Retiro en local CDE'}
            </span>
            <span className="font-semibold">
              {modalidadEntrega === 'delivery'
                ? formatGuaranies(COSTO_DELIVERY_CDE)
                : 'Gratis'}
            </span>
          </div>
        )}

        <div className="pt-2 border-t border-dashed border-gray-200 flex justify-between items-center text-base font-extrabold text-gray-900">
          <span>Precio Total Alquiler</span>
          <span>{formatGuaranies(precioTotal)}</span>
        </div>
      </div>

      {/* Desglose 50% seña / 50% retiro / garantía */}
      <div className="bg-brand-bg rounded-2xl p-3.5 space-y-2 border border-pink-100">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-brand-pink">
            👉 Hoy pagás 50% (Seña para reservar)
          </span>
          <span className="text-lg font-extrabold text-brand-pink">
            {formatGuaranies(hoyPagas50)}
          </span>
        </div>

        <div className="flex justify-between items-center text-xs text-gray-600">
          <span>Saldo 50% al retirar el kit</span>
          <span className="font-bold text-gray-800">
            {formatGuaranies(saldoAlRetirar)}
          </span>
        </div>

        <div className="pt-2 border-t border-pink-200/60 flex justify-between items-center text-xs text-teal-800">
          <span className="flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-4 h-4 text-brand-teal" />
            Garantía reembolsable (se devuelve al entregar)
          </span>
          <span className="font-bold">{formatGuaranies(garantia)}</span>
        </div>
      </div>
    </div>
  );
}
