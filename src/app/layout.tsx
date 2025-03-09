import type { Metadata } from 'next';
import './globals.css';
import Layout from '@/components/layout/Layout';
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
          <Layout>
            {children}
          </Layout>
        </Provider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}