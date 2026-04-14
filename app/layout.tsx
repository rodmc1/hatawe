import type { Metadata } from 'next';
import './globals.css';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Inter } from 'next/font/google';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'Hatawe',
  description: 'Hatawe Badminton'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
              </header>
              <main className="flex-1">{children}</main>
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
