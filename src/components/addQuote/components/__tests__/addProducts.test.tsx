import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { TestProviders } from '@/test/testProviders';
import AddProducts from '../addProducts';
import { defaultRecords } from '@/test/supabaseMock';
import userEvent from '@testing-library/user-event';

vi.mock('@/lib/supabase', async () => {
  const { createSupabaseMock } = await import('@/test/supabaseMock');
  return createSupabaseMock();
});

describe('Add Client with data fetch success', () => {
  test('should display quote products', async () => {
    const dispatch = vi.fn();

    render(
      <TestProviders>
        <AddProducts quoteProducts={defaultRecords.quote_product} dispatch={dispatch} />
      </TestProviders>
    );

    // Check that the products are rendered
    expect(screen.getByText('1 x Test Product')).toBeInTheDocument();
    expect(screen.getByText('2 x Second Product')).toBeInTheDocument();
  });

  test('should calculate the total values correctly', async () => {
    const dispatch = vi.fn();

    render(
      <TestProviders>
        <AddProducts quoteProducts={defaultRecords.quote_product} dispatch={dispatch} />
      </TestProviders>
    );

    // total value should be 124 + 552 = 676
    expect(screen.getByText('£ 676.00')).toBeInTheDocument();
    // total VAT should be 24 + 92 = 116
    expect(screen.getByText('£ 116.00')).toBeInTheDocument();
  });

  test('should call dispatch to move to next step when Next button is clicked', async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();

    render(
      <TestProviders>
        <AddProducts quoteProducts={defaultRecords.quote_product} dispatch={dispatch} />
      </TestProviders>
    );

    const nextButton = screen.getByRole('button', { name: /Next/i });
    user.click(nextButton);

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({ type: 'SET_STEP', step: 'QuoteSummary' });
    });
  });

  test('should call dispatch to remove a product when Remove button is clicked', async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();

    render(
      <TestProviders>
        <AddProducts quoteProducts={defaultRecords.quote_product} dispatch={dispatch} />
      </TestProviders>
    );

    // click the first product's action button to open the menu
    const productActionButtons = screen.getAllByLabelText('Product actions');
    expect(productActionButtons.length).toBeGreaterThan(0);
    await user.click(productActionButtons[0]);

    // click the Remove button
    await waitFor(() => {
      expect(screen.getByText('Remove')).toBeInTheDocument();
    });
    const removeButton = screen.getByText('Remove');
    await user.click(removeButton);

    // check that dispatch was called with the updated product list
    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_QUOTE_PRODUCTS',
        quoteProducts: [defaultRecords.quote_product[1]],
      });
    });
  });

  test('should call dispatch to open add product modal when Add Product button is clicked', async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();

    render(
      <TestProviders>
        <AddProducts quoteProducts={[]} dispatch={dispatch} />
      </TestProviders>
    );

    // click the Add Product button
    const addButton = screen.getByRole('button', { name: /Add Product/i });
    await user.click(addButton);

    // check that dispatch was called to open the add product modal
    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({ type: 'OPEN_ADD_PRODUCT_MODAL' });
    });
  });

  test('should call dispatch to open edit product modal when Edit button is clicked', async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();

    render(
      <TestProviders>
        <AddProducts quoteProducts={defaultRecords.quote_product} dispatch={dispatch} />
      </TestProviders>
    );

    // click the first product's action button to open the menu
    const productActionButtons = screen.getAllByLabelText('Product actions');
    expect(productActionButtons.length).toBeGreaterThan(0);
    await user.click(productActionButtons[0]);

    // click the edit button
    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
    const editButton = screen.getByText('Edit');
    await user.click(editButton);

    // check that dispatch was called to open the edit product modal for the correct index
    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({ type: 'OPEN_EDIT_PRODUCT_MODAL', index: 0 });
    });
  });

  test('should call dispatch to go to previous step when Back button is clicked', async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();

    render(
      <TestProviders>
        <AddProducts quoteProducts={[]} dispatch={dispatch} />
      </TestProviders>
    );

    // click the back button
    const backButton = screen.getByRole('button', { name: /Back/i });
    await user.click(backButton);

    // check that dispatch was called to go to previous step
    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({ type: 'SET_STEP', step: 'AddClient' });
    });
  });

  test('should display no products message when quoteProducts is empty', async () => {
    const dispatch = vi.fn();

    render(
      <TestProviders>
        <AddProducts quoteProducts={[]} dispatch={dispatch} />
      </TestProviders>
    );

    // Check that the no products message is rendered
    expect(screen.getByText('No products added.')).toBeInTheDocument();
    expect(screen.getByText('Click the Add Product button to add items to the quote')).toBeInTheDocument();
  });
});
