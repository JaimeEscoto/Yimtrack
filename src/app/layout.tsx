import './globals.css';
import type { Metadata, Viewport } from 'next';
import InstallPrompt from '@/components/InstallPrompt';

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
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
