import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Yimtrack',
  description: 'Tu red social de entrenamiento'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
