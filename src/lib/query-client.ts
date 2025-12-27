import { QueryClient } from '@tanstack/react-query';

/**
 * Default stale time for queries.
 * Financial data should be reasonably fresh but doesn't need real-time updates.
 * 5 minutes provides a good balance between freshness and performance.
 */
const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * Default garbage collection time for inactive queries.
 * Queries that haven't been used for 30 minutes will be garbage collected.
 */
const DEFAULT_GC_TIME = 30 * 60 * 1000; // 30 minutes

/**
 * Creates a new QueryClient instance with default configuration.
 * This function should be called once per client-side application lifecycle.
 *
 * @returns Configured QueryClient instance
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 5 minutes
        staleTime: DEFAULT_STALE_TIME,
        // Inactive queries are garbage collected after 30 minutes
        gcTime: DEFAULT_GC_TIME,
        // Retry failed queries up to 3 times with exponential backoff
        retry: 3,
        // Only refetch on window focus if data is stale
        refetchOnWindowFocus: 'always',
        // Don't refetch on reconnect unless data is stale
        refetchOnReconnect: 'always',
        // Don't refetch on mount if data exists and is not stale
        refetchOnMount: true,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
      },
    },
  });
}

/**
 * Singleton QueryClient instance for use in the browser.
 * This ensures we reuse the same client across the application.
 */
let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Gets or creates a QueryClient instance.
 * On the server, always creates a new instance.
 * On the client, reuses a singleton instance.
 *
 * @returns QueryClient instance
 */
export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return createQueryClient();
  }

  // Browser: make a new query client if we don't already have one
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }

  return browserQueryClient;
}
