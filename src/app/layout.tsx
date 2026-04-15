import type { Metadata } from 'next';
import './globals.css';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'Hatawe',
  description: 'Hatawe Badminton'
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get('sidebar_state');
  const defaultSidebarOpen = sidebarState ? sidebarState.value === 'true' : true;

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          <SidebarProvider defaultOpen={defaultSidebarOpen}>
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
