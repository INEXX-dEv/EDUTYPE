import type { Metadata } from 'next';
import { Providers } from './providers';
import { CookieConsent } from '@/components/layout/CookieConsent';
import './globals.css';

export const metadata: Metadata = {
  title: 'LernStack - Modern Eğitim Platformu',
  description:
    'LernStack ile video dersler, interaktif sınavlar ve sertifikalar ile eğitiminizi bir üst seviyeye taşıyın.',
  keywords: ['eğitim', 'online kurs', 'video ders', 'sertifika', 'LernStack'],
  authors: [{ name: 'LernStack' }],
  openGraph: {
    title: 'LernStack - Modern Eğitim Platformu',
    description: 'Video dersler, interaktif sınavlar ve sertifikalar ile eğitiminizi bir üst seviyeye taşıyın.',
    type: 'website',
    locale: 'tr_TR',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <body className="min-h-screen bg-surface-950 text-surface-100 antialiased">
        <Providers>
          {children}
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
