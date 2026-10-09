import type { Metadata } from 'next';
import { Cantata_One, Fraunces, Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
});
const cantata = Cantata_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-cantata',
});

export const metadata: Metadata = {
  title: 'racha conta',
  description: 'Aplicação para dividir contas entre amigos',
  icons: {
    icon: '/friends.PNG',
  },
  openGraph: {
    title: 'Divisão de Contas',
    description: 'Aplicação para dividir contas entre amigos',
    images: [{ url: '/friends.PNG' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} ${fraunces.variable} ${cantata.variable}`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'oklch(0.995 0.004 95)',
                color: 'oklch(0.24 0.028 168)',
                border: '1px solid oklch(0.905 0.016 90)',
                boxShadow: '0 10px 24px -12px oklch(0.28 0.03 165 / 0.22)',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
              },
            }}
          />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
