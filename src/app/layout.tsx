import type { Metadata } from 'next';
import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin']
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://hatawe.app'),
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
