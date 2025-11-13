import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { TestProviders } from '@/test/testProviders';
import AddClient from '../addClient';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            data: null,
            error: { message: 'Failed to load clients.' },
          }),
        }),
      }),
    }),
  },
}));

describe('Add Client with data fetch error', () => {
  test('if clients fail to load, an error message is shown', async () => {
    const dispatch = vi.fn();

    render(
      <TestProviders>
        <AddClient clientId={0} dispatch={dispatch} />
      </TestProviders>
    );
    const errorMessage = await screen.findByText(/Failed to load clients./i);
    expect(errorMessage).toBeInTheDocument();
  });
});
