'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRef } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClientRef = useRef<QueryClient>(undefined);

  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient(
      {
        defaultOptions: {
          queries: {
            retry: false, // for test reason
          },
        },
      }
    );
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      {children}
    </QueryClientProvider>
  );
}