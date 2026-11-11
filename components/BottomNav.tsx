'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, CalendarCheck, UserCheck } from 'lucide-react';
import { useApp } from '@/lib/store';

export default function BottomNav() {
  const pathname = usePathname();
  const { esDecoradora } = useApp();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    {
      label: 'Inicio',
      href: '/',
      icon: Home,
      active: pathname === '/',
    },
    {
      label: 'Catálogo',
      href: '/?catalogo=1#catalogo',
      icon: Grid,
      active: pathname.startsWith('/kit'),
    },
    {
      label: 'Reservas',
      href: '/reserva',
      icon: CalendarCheck,
      active: pathname === '/reserva' || pathname === '/pago',
    },
    {
      label: 'Perfil',
      href: '/mi-cuenta',
      icon: UserCheck,
      active: pathname === '/mi-cuenta',
      badge: esDecoradora ? 'PRO' : undefined,
    },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-sm no-print">
      <div className="max-w-xl mx-auto px-2 h-14 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                item.active
                  ? 'text-brand-pink font-bold scale-105'
                  : 'text-gray-500 hover:text-gray-800 font-medium'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  item.active ? 'stroke-[2.5px] text-brand-pink' : 'stroke-[1.8px]'
                }`}
              />
              <span className="text-[11px] mt-0.5">{item.label}</span>
              {item.badge && (
                <span className="absolute -top-0.5 right-1 px-1.5 py-0.2 bg-brand-gold text-white text-[9px] font-extrabold rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
