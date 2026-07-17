import { QueryClient } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/query-persist-client-core'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const TWELVE_HOURS = 1000 * 60 * 60 * 12

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: TWELVE_HOURS, // keep in memory cache for up to 12 h
      staleTime: Infinity,  // never auto-refetches — no server source
    },
  },
})

if (typeof window !== 'undefined') {
  persistQueryClient({
    queryClient,
    persister: createSyncStoragePersister({ storage: window.localStorage }),
    maxAge: TWELVE_HOURS,
  })
}
