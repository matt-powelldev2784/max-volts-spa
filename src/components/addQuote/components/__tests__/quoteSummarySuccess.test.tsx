import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { TestProviders } from '@/test/testProviders';
import { defaultRecords } from '@/test/supabaseMock';
import userEvent from '@testing-library/user-event';
import QuoteSummary from '../quoteSummary';
import type { QuoteStatus } from '@/types/dbTypes';

vi.mock('@/lib/supabase', async () => {
  const { createSupabaseMock } = await import('@/test/supabaseMock');
  return createSupabaseMock();
});

vi.mock('@/lib/useAuth', () => ({
  default: () => ({
    user: {
      id: '12345',
      email: 'demo@test.com',
    },
    loading: false,
  }),
}));

const dispatch = vi.fn();
const quoteData = { notes: '', status: 'quoted' as QuoteStatus, total_value: 350, total_vat: 70 };

describe('quoteSummary component', () => {
  beforeEach(() => {
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
  });

  test('should render client, products and submit sections', async () => {
    // check for client, products and submit sections
    await waitFor(() => {
      expect(screen.getByText('Client Details')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    // check for client details
    expect(screen.getByText(defaultRecords.client[0].name)).toBeInTheDocument();

    // check for product details
    const product1 = defaultRecords.quote_product[0];
    expect(screen.getByText(`1 x ${product1.name}`)).toBeInTheDocument();
    const product2 = defaultRecords.quote_product[1];
    expect(screen.getByText(`2 x ${product2.name}`)).toBeInTheDocument();

    // check for total value and vat
    expect(screen.getByText('£ 350.00')).toBeInTheDocument();
    expect(screen.getByText('£ 70.00')).toBeInTheDocument();
  });

  test('user should be able to change quote status', async () => {
    // change quote status and check the dropdown value changes
    // fireEvent used instead of userEvent due to issues with select component
    const statusSelect = await screen.findByRole('combobox');
    fireEvent.click(statusSelect);
    const quotedOption = await screen.findByRole('option', { name: /Accepted/i });
    fireEvent.click(quotedOption);
    expect(screen.getByText(/Accepted/i)).toBeInTheDocument();
  });

  test('user should be able to click create quote button', async () => {
    // check that create quote button is rendered and enabled
    const createQuoteButton = screen.getByRole('button', { name: /Create Quote/i });
    expect(createQuoteButton).toBeInTheDocument();
    expect(createQuoteButton).not.toBeDisabled();
  });

  test('should call dispatch to add notes ', async () => {
    const user = userEvent.setup();

    // type in the notes textarea
    const notesTextarea = screen.getByLabelText('Notes');
    await user.type(notesTextarea, 'These are some test notes.');

    // click outside to notes textarea to trigger onBlur function
    await user.click(document.body);

    // check that dispatch was called with the correct payload
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_QUOTE_DATA',
      payload: { ...quoteData, notes: 'These are some test notes.' },
    });
  });

  test('should go to previous step when Back button is clicked', async () => {
    const user = userEvent.setup();

    // click the back button and check that dispatch was called with the correct step
    const backButton = screen.getByRole('button', { name: /Back/i });
    await user.click(backButton);
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_STEP', step: 'AddProducts' });
  });
});
