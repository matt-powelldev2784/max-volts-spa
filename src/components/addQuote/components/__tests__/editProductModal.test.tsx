import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { TestProviders } from '@/test/testProviders';
import { defaultRecords } from '@/test/supabaseMock';
import EditProductModal from '../editProductModal';
import userEvent from '@testing-library/user-event';

vi.mock('@/lib/supabase', async () => {
  const { createSupabaseMock } = await import('@/test/supabaseMock');
  return createSupabaseMock();
});

const dispatch = vi.fn();
const user = userEvent.setup();

describe('Edit Product Modal', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    render(
      <TestProviders>
        <EditProductModal
          isModalOpen={true}
          products={defaultRecords.product}
          quoteProducts={defaultRecords.quote_product}
          selectedQuoteProductIndex={0}
          dispatch={dispatch}
        />
      </TestProviders>
    );
  });

  test('should display the correct product name in the select', async () => {
    const selectProductDropdownMenu = await screen.findByRole('combobox');
    expect(selectProductDropdownMenu).toHaveTextContent(/Test Product/i);
    expect(selectProductDropdownMenu).toBeDisabled();
  });

  test('should populate fields with existing product data', async () => {
    const quantityInput = await screen.findByLabelText(/Quantity/i);
    expect((quantityInput as HTMLInputElement).value).toBe('1');

    const markupInput = await screen.findByLabelText(/Markup/i);
    expect((markupInput as HTMLInputElement).value).toBe('10');

    const valueInput = await screen.findByLabelText(/Cost/i);
    expect((valueInput as HTMLInputElement).value).toBe('100');

    const vatRateInput = await screen.findByLabelText(/VAT Rate/i);
    expect((vatRateInput as HTMLInputElement).value).toBe('20');

    const descriptionInput = await screen.findByLabelText(/Description/i);
    expect((descriptionInput as HTMLInputElement).value).toBe('Description for test product');
  });

  test('should update quantity, markup, and VAT rate', async () => {
    const quantityInput = await screen.findByLabelText(/Quantity/i);
    await user.clear(quantityInput);
    await user.type(quantityInput, '5');
    expect((quantityInput as HTMLInputElement).value).toBe('5');

    const markupInput = await screen.findByLabelText(/Markup/i);
    await user.clear(markupInput);
    await user.type(markupInput, '25');
    expect((markupInput as HTMLInputElement).value).toBe('25');

    const vatRateInput = await screen.findByLabelText(/VAT Rate/i);
    await user.clear(vatRateInput);
    await user.type(vatRateInput, '15');
    expect((vatRateInput as HTMLInputElement).value).toBe('15');
  });

  test('should update description', async () => {
    const descriptionInput = await screen.findByLabelText(/Description/i);
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'Updated description');
    expect((descriptionInput as HTMLInputElement).value).toBe('Updated description');
  });

  test('should update total value when fields change', async () => {
    const quantityInput = await screen.findByLabelText(/Quantity/i);
    await user.clear(quantityInput);
    await user.type(quantityInput, '3');

    const markupInput = await screen.findByLabelText(/Markup/i);
    await user.clear(markupInput);
    await user.type(markupInput, '100');

    const vatRateInput = await screen.findByLabelText(/VAT Rate/i);
    await user.clear(vatRateInput);
    await user.type(vatRateInput, '10');

    const totalValueText = await screen.findByText(/Total: £660.00/i);
    expect(totalValueText).toBeInTheDocument();
  });

  test('should close modal when cancel button is clicked', async () => {
    const cancelButton = await screen.findByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({ type: 'CLOSE_EDIT_PRODUCT_MODAL' });
    });
  });

  test('should save changes when save button is clicked', async () => {
    const saveButton = await screen.findByRole('button', { name: /Save Changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_QUOTE_PRODUCTS',
        quoteProducts: expect.any(Array),
      });
      expect(dispatch).toHaveBeenCalledWith({ type: 'CLOSE_EDIT_PRODUCT_MODAL' });
    });
  });
});
