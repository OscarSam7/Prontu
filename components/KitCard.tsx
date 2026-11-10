'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { Kit, formatGuaranies } from '@/lib/kits';
import { useApp } from '@/lib/store';

interface KitCardProps {
  kit: Kit;
}

export default function KitCard({ kit }: KitCardProps) {
  const { esDecoradora, esFechaOcupada } = useApp();
  const hoyStr = new Date().toISOString().split('T')[0];
  const ocupadoHoy = !kit.disponible || esFechaOcupada(kit.id, hoyStr);

  const precioActual = esDecoradora ? kit.precioDecoradora : kit.precioPublico;
  const ahorro = kit.precioPublico - kit.precioDecoradora;

  return (
    <Link
      href={`/kit/${kit.id}`}
      className="group bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-soft border border-pink-100/80 transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Imagen + Badges */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-pink-50">
          <img
            src={kit.fotos[0]}
            alt={kit.nombre}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {/* Badge Disponible / Ocupado */}
          <div className="absolute top-3 left-3">
            {!ocupadoHoy ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-teal text-white shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Disponible
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-600 text-white shadow-sm">
                <Clock className="w-3.5 h-3.5" />
                Ocupado Hoy
              </span>
            )}
          </div>

          {/* Categoría Pill */}
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-white/90 backdrop-blur-sm text-gray-800 shadow-sm">
              {kit.categoria}
            </span>
          </div>

          {/* Etiqueta Decoradora si está activa */}
          {esDecoradora && (
            <div className="absolute bottom-2 left-2 right-2 bg-brand-gold/95 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center justify-center gap-1 shadow">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Ahorrás {formatGuaranies(ahorro)} con membresía</span>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-3.5 sm:p-4">
          <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold mb-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{kit.rating.toFixed(1)}</span>
            <span className="text-gray-400 font-normal">({kit.reseñas})</span>
          </div>

          <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug line-clamp-1 group-hover:text-brand-pink transition-colors">
            {kit.nombre}
          </h3>

          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {kit.descripcion}
          </p>
        </div>
      </div>

      {/* Precio y CTA */}
      <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 pt-1 border-t border-gray-100 flex items-end justify-between">
        <div>
          {esDecoradora && (
            <span className="block text-[11px] text-gray-400 line-through">
              {formatGuaranies(kit.precioPublico)}
            </span>
          )}
          <span className="text-xs text-gray-500 block">Alquiler completo</span>
          <span className="text-base sm:text-lg font-extrabold text-brand-pink">
            {formatGuaranies(precioActual)}
          </span>
        </div>

        <span className="px-3 py-1.5 rounded-2xl bg-pink-50 text-brand-pink group-hover:bg-brand-pink group-hover:text-white text-xs font-bold transition-colors">
          Ver kit →
        </span>
      </div>
    </Link>
  );
}
