'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { DEFAULT_NEGOCIO_ID } from '@/lib/kits';
import { useApp } from '@/lib/store';
import TesoreriaManager from '@/components/TesoreriaManager';

export default function AdminTesoreriaPage() {
  const { negocios } = useApp();
  const tiendaLocal = negocios.find((n) => n.id === DEFAULT_NEGOCIO_ID);

  return (
    <main className="px-4 pt-4 pb-12 space-y-5 print:p-0">
      <div className="flex flex-wrap items-center justify-between gap-2 no-print">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white shadow-sm border border-pink-100 text-sm font-bold text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Dashboard
        </Link>
        <span className="text-xs font-extrabold text-brand-teal bg-teal-50 px-3 py-1.5 rounded-xl">
          Tesorería y Resultados del Ejercicio
        </span>
      </div>

      <TesoreriaManager
        negocioId={DEFAULT_NEGOCIO_ID}
        negocioNombre={tiendaLocal?.nombre || 'Pegue y Monte CDE'}
      />
    </main>
  );
}
