'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { DEFAULT_NEGOCIO_ID } from '@/lib/kits';
import { useApp } from '@/lib/store';
import StoreBrandingEditor from '@/components/StoreBrandingEditor';

export default function AdminTiendaPage() {
  const { negocios } = useApp();
  const negocioLocal =
    negocios.find((n) => n.id === DEFAULT_NEGOCIO_ID) || negocios[0];

  return (
    <main className="px-4 pt-4 pb-12 space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white shadow-sm border border-pink-100 text-sm font-bold text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Admin
        </Link>

        <Link
          href="/"
          className="text-xs font-extrabold text-brand-pink bg-pink-50 px-3 py-1.5 rounded-xl"
        >
          Ver Inicio →
        </Link>
      </div>

      {negocioLocal && <StoreBrandingEditor negocio={negocioLocal} />}
    </main>
  );
}
