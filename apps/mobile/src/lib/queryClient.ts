import { QueryClient } from '@tanstack/react-query';

/**
 * Shared TanStack Query client. Scaffolding only — sensible defaults, no
 * queries defined yet.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});
