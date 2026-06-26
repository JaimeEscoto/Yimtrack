import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import InstallPrompt from '@/components/InstallPrompt';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Yimtrack',
  description: 'Tu red social de entrenamiento',
  manifest: '/manifest.webmanifest',
  applicationName: 'Yimtrack',
  appleWebApp: {
    capable: true,
    title: 'Yimtrack',
    statusBarStyle: 'black-translucent'
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg' }]
  }
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body>
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
