import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

type TestProvidersProps = {
  children: ReactNode;
  queryClientOverride?: QueryClient;
};

export const TestProviders = ({ children, queryClientOverride }: TestProvidersProps) => (
  <MemoryRouter>
    <QueryClientProvider client={queryClientOverride || queryClient}>{children}</QueryClientProvider>
  </MemoryRouter>
);
