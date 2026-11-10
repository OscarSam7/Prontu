import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/store';
import BottomNav from '@/components/BottomNav';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Pegue y Monte CDE | Alquiler de Decoración y Audiovisual',
  description:
    'Alquilá kits de decoración para cumpleaños, 15 años, bodas y equipos de sonido, luces y pantallas en Ciudad del Este, Paraguay.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Pegue y Monte CDE',
  },
};

export const viewport: Viewport = {
  themeColor: '#FF4D7A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={poppins.variable}>
      <body className="font-sans bg-brand-bg text-gray-900 min-h-screen pb-24 antialiased">
        <AppProvider>
          <div className="max-w-4xl mx-auto min-h-screen">{children}</div>
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
