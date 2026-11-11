import React from 'react';
import AdminGuard from '@/components/AdminGuard';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard
      authEndpoint="/api/super-admin-auth"
      requireEmail={false}
      title="Panel Super Admin • SaaS"
      subtitle="Control central de tiendas suscriptoras, planes y cobros mensuales en Guaraníes."
      badgeLabel="Super Admin Maestro"
      pinPlaceholder="Ingresá PIN Maestro"
    >
      {children}
    </AdminGuard>
  );
}
