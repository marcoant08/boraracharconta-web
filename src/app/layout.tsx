import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Divisão de Contas',
  description: 'Aplicação para dividir contas entre amigos',
  icons: {
    icon: '/logo.PNG',
  },
  openGraph: {
    title: 'Divisão de Contas',
    description: 'Aplicação para dividir contas entre amigos',
    images: [{ url: '/logo.PNG' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
