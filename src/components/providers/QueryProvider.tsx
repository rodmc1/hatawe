'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, lazy, Suspense, type ReactNode } from 'react';

const ReactQueryDevtools =
  process.env.NODE_ENV === 'development'
    ? lazy(() => import('@tanstack/react-query-devtools').then(m => ({ default: m.ReactQueryDevtools })))
    : null;

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {ReactQueryDevtools && (
        <Suspense>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      )}
    </QueryClientProvider>
  );
}
