'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import KitDetailView from '@/components/views/KitDetailView';

export default function KitDetailPage() {
  const params = useParams();
  const kitId = Number(params?.id || 1);
  return <KitDetailView kitId={kitId} />;
}
