'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import KitDetailView from '@/components/views/KitDetailView';

export default function TiendaKitDetailPage() {
  const params = useParams();
  const slug = String(params?.slug || '');
  const kitId = Number(params?.id || 1);
  const { negocios } = useApp();

  const negocio = negocios.find((n) => n.slug === slug);

  return (
    <KitDetailView
      kitId={kitId}
      basePath={`/tienda/${slug}`}
      negocioId={negocio?.id}
      ciudadLabel={negocio?.ciudad || 'Paraguay'}
    />
  );
}
