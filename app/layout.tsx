import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import { Header } from '@/components/Header';
import { MswProvider } from '@/providers/MswProvider';
import { ReduxProvider } from '@/store/ReduxProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorFallback } from '@/components/ErrorFallback';
import { Footer } from '@/components/Footer';
import { SentryContextSync } from '@/components/SentryContextSync';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CryptoDash — Real-time Cryptocurrency Tracker',
  description:
    'Track cryptocurrency prices in real-time with live WebSocket updates, interactive charts, and multi-currency support.',
  keywords: ['cryptocurrency', 'bitcoin', 'ethereum', 'price tracker', 'real-time'],
  openGraph: {
    title: 'CryptoDash',
    description: 'Real-time cryptocurrency dashboard',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ErrorBoundary fallback={<ErrorFallback />}>
          <ReduxProvider>
            <SentryContextSync />
            <MswProvider>
              <QueryProvider>
                <Header />
                <ErrorBoundary fallback={<ErrorFallback />}>{children}</ErrorBoundary>
                <Footer />
              </QueryProvider>
            </MswProvider>
          </ReduxProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
