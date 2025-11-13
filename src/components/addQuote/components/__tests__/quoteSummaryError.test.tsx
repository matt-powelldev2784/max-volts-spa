import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { TestProviders } from '@/test/testProviders';
import { defaultRecords } from '@/test/supabaseMock';
import QuoteSummary from '../quoteSummary';
import type { QuoteStatus } from '@/types/dbTypes';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => ({
            data: null,
            error: { message: 'Error Message' },
          }),
        }),
      }),
    }),
  },
}));

vi.mock('@/lib/useAuth', () => ({
  default: () => ({
    user: {
      id: '12345',
      email: 'demo@test.com',
    },
    loading: false,
  }),
}));

const quoteData = {
  notes: '',
  status: 'quoted ' as QuoteStatus,
  total_value: 0,
  total_vat: 0,
};

describe('QuoteSummary with client fetch error', () => {
  test('shows error message when client fails to load', async () => {
    const dispatch = vi.fn();

    render(
      <TestProviders>
        <QuoteSummary
          clientId={defaultRecords.client[0].id}
          quoteProducts={defaultRecords.quote_product}
          quoteData={quoteData}
          dispatch={dispatch}
        />
      </TestProviders>
    );

    const errorMessage = await screen.findByText(/Failed to load client./i);
    expect(errorMessage).toBeInTheDocument();
  });
});
