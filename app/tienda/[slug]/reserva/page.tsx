'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import ReservaView from '@/components/views/ReservaView';

export default function TiendaReservaPage() {
  const params = useParams();
  const slug = String(params?.slug || '');
  const { negocios } = useApp();

  const negocio = negocios.find((n) => n.slug === slug);

  return (
    <ReservaView
      basePath={`/tienda/${slug}`}
      negocioId={negocio?.id}
      negocioNombre={negocio?.nombre || 'Tienda'}
      ciudadLabel={negocio?.ciudad || 'Paraguay'}
    />
  );
}
