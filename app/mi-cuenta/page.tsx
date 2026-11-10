'use client';

import React from 'react';
import Link from 'next/link';
import {
  Crown,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Calculator,
  Award,
} from 'lucide-react';
import { formatGuaranies } from '@/lib/kits';
import { useApp } from '@/lib/store';

export default function MiCuentaDecoradoraPage() {
  const { kits, esDecoradora, toggleDecoradora } = useApp();

  const ejemplosAhorro = [
    kits.find((k) => k.id === 1)!, // Safari Baby
    kits.find((k) => k.id === 5)!, // Stitch Azul
    kits.find((k) => k.id === 15)!, // 15 Dorado Lujo
    kits.find((k) => k.id === 21)!, // Boda Boho
    kits.find((k) => k.id === 38)!, // Kit Fiesta Total
  ];

  return (
    <main className="px-4 pt-4 pb-10 space-y-5">
      <div className="bg-gradient-to-br from-brand-gold via-amber-500 to-rose-500 rounded-3xl p-6 text-white shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-extrabold">
            <Crown className="w-4 h-4" /> Club de Decoradoras CDE
          </span>
          <span className="text-xs font-bold bg-black/20 px-2.5 py-1 rounded-xl">
            Paraguay
          </span>
        </div>

        <h1 className="text-2xl font-extrabold leading-tight">
          Cuenta Decoradora Profesional
        </h1>
        <p className="text-xs sm:text-sm text-amber-50">
          Activá tu perfil de Decoradora para alquilar los 38 kits a precio mayorista y aumentar tu ganancia en cada evento en Ciudad del Este, Hernandarias, Franco y Minga Guazú.
        </p>

        {/* Toggle Principal */}
        <div className="bg-white text-gray-900 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="font-extrabold text-sm sm:text-base flex items-center gap-2">
              Soy Decoradora
              {esDecoradora && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Membresía Activa
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Cambia todos los precios del catálogo a tarifa mayorista automáticamente
            </p>
          </div>

          <button
            type="button"
            onClick={toggleDecoradora}
            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors shrink-0 ${
              esDecoradora ? 'bg-brand-teal' : 'bg-gray-300'
            }`}
          >
            <div
              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${
                esDecoradora ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Banner de ahorro en vivo */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-amber-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-brand-gold flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-gray-900 text-sm sm:text-base">
              {esDecoradora
                ? '¡Estás viendo todos los kits con descuento!'
                : 'Ahorrás desde Gs. 100.000 hasta Gs. 600.000 por alquiler'}
            </h2>
            <p className="text-xs text-gray-500">
              Con solo 2 eventos al mes multiplicás tu rentabilidad sin comprar estructuras.
            </p>
          </div>
        </div>
      </div>

      {/* Tabla Comparativa de Ahorro */}
      <section className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-pink-100 space-y-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-brand-pink" />
          <h3 className="font-bold text-gray-900 text-base">
            Comparativa de Precios y Ahorro con Membresía
          </h3>
        </div>

        <div className="space-y-2.5">
          {ejemplosAhorro.map((k) => {
            const ahorro = k.precioPublico - k.precioDecoradora;
            return (
              <div
                key={k.id}
                className="p-3 rounded-2xl bg-brand-bg border border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <span className="text-xs font-bold text-brand-pink">
                    {k.categoria}
                  </span>
                  <h4 className="font-bold text-gray-900 text-sm">{k.nombre}</h4>
                  <span className="text-xs text-gray-500">
                    Público: <del>{formatGuaranies(k.precioPublico)}</del> →{' '}
                    <strong className="text-gray-900">
                      Decoradora: {formatGuaranies(k.precioDecoradora)}
                    </strong>
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 text-xs font-extrabold self-start sm:self-center">
                  <Award className="w-4 h-4 text-brand-gold" />
                  Ahorrás {formatGuaranies(ahorro)} con membresía
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="w-full py-3.5 rounded-2xl bg-brand-pink text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md"
          >
            Ir al catálogo con precios {esDecoradora ? 'Decoradora' : 'actualizados'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Beneficios */}
      <section className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-pink-100 space-y-2.5">
        <h3 className="font-bold text-gray-900 text-sm">
          Beneficios exclusivos para Decoradoras de Alto Paraná:
        </h3>
        <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0" />
            Retiro prioritario desde el viernes para eventos del fin de semana.
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0" />
            Fundas sublimadas siempre limpias, planchadas y listas para montar.
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0" />
            Acceso a los 38 kits de tendencia sin gastar en depósito ni carpintería.
          </li>
        </ul>
      </section>
    </main>
  );
}
