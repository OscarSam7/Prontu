'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import PagoView from '@/components/views/PagoView';

export default function TiendaPagoPage() {
  const params = useParams();
  const slug = String(params?.slug || '');
  const { negocios } = useApp();

  const negocio = negocios.find((n) => n.slug === slug);

  return (
    <PagoView
      basePath={`/tienda/${slug}`}
      negocioId={negocio?.id}
      negocioNombre={negocio?.nombre || 'Tienda'}
      whatsapp={negocio?.whatsapp || '0983 637 780'}
      aliasSipap={negocio?.aliasSipap || negocio?.whatsapp || ''}
      qrPagoUrl={negocio?.qrPagoUrl}
    />
  );
}
