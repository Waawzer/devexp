import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Provider from '@/components/providers/SessionProvider';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'DevExp - Plateforme de collaboration',
  description: 'Connectez développeurs et clients pour des projets collaboratifs.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
          <Footer />
        </Provider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}