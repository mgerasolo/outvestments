'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

import { createQueryClient } from '@/lib/query-client';

/**
 * Props for the QueryProvider component.
 */
interface QueryProviderProps {
  /** Child components to be wrapped with QueryClientProvider */
  readonly children: ReactNode;
}

/**
 * Client-side React Query provider component.
 *
 * This component initializes and provides the QueryClient to the application.
 * It uses useState to ensure the QueryClient is created once per component
 * lifecycle, preventing issues with server-side rendering.
 *
 * @example
 * ```tsx
 * // In your root layout
 * export default function RootLayout({ children }: { children: ReactNode }) {
 *   return (
 *     <html>
 *       <body>
 *         <QueryProvider>{children}</QueryProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function QueryProvider({ children }: QueryProviderProps): ReactNode {
  // Create QueryClient once per component instance
  // Using useState with initializer function ensures this only runs once
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
