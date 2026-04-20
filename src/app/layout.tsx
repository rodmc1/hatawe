import type { Metadata } from 'next';
import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin']
});

const FALLBACK_APP_URL = new URL('https://hatawe.app');

function resolveAppUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_APP_URL;
  if (!raw) return FALLBACK_APP_URL;
  try {
    return new URL(raw);
  } catch {
    if (process.env.NODE_ENV === 'development') {
      throw new Error(`NEXT_PUBLIC_APP_URL "${raw}" is not a valid absolute URL.`);
    }
    console.warn(`NEXT_PUBLIC_APP_URL "${raw}" is not a valid URL. Falling back to ${FALLBACK_APP_URL.href}.`);
    return FALLBACK_APP_URL;
  }
}

export const metadata: Metadata = {
  metadataBase: resolveAppUrl(),
  title: {
    default: 'Hatawe',
    template: '%s | Hatawe'
  },
  description:
    'Hatawe — the all-in-one badminton club platform for managing players, courts, queuing, tournaments, and rankings.',
  keywords: ['badminton', 'club management', 'tournament', 'queuing', 'rankings', 'courts', 'players'],
  authors: [{ name: 'Hatawe' }],
  openGraph: {
    type: 'website',
    siteName: 'Hatawe',
    title: 'Hatawe — Badminton Club Platform',
    description:
      'Manage players, courts, queuing, tournaments, and rankings for your badminton club — all in one place.',
    images: [{ url: '/assets/hatawe.jpg', width: 1200, height: 630, alt: 'Hatawe Badminton' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hatawe — Badminton Club Platform',
    description:
      'Manage players, courts, queuing, tournaments, and rankings for your badminton club — all in one place.',
    images: ['/assets/hatawe.jpg']
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
