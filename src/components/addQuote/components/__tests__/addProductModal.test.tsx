import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { TestProviders } from '@/test/testProviders';
import { defaultRecords } from '@/test/supabaseMock';
import AddProductModal from '../addProductModal';

vi.mock('@/lib/supabase', async () => {
  const { createSupabaseMock } = await import('@/test/supabaseMock');
  return createSupabaseMock();
});

const dispatch = vi.fn();

describe('Add Client with data fetch success', () => {
  beforeEach(() => {
    render(
      <TestProviders>
        <AddProductModal
          isModalOpen={true}
          products={defaultRecords.product}
          quoteProducts={defaultRecords.quote_product}
          dispatch={dispatch}
        />
      </TestProviders>
    );
  });

  test('should be able to select a product', async () => {
    // click on drop down menu
    // fireEvent used instead of userEvent due to issues with select component
    const selectClientDropdownMenu = await screen.findByRole('combobox');
    await waitFor(() => expect(selectClientDropdownMenu).not.toBeDisabled());
    fireEvent.click(selectClientDropdownMenu);

    // select first option
    const options = await screen.findAllByRole('option');
    const firstOption = options[0];
    expect(firstOption).toHaveTextContent(/Test Product/i);
    fireEvent.click(firstOption);

    // check the selected option is shown in the select trigger
    await waitFor(() => {
      expect(selectClientDropdownMenu).toHaveTextContent(/Test Product/i);
    });
  });

  test('should be able to set the quantity', async () => {
    // find quantity input and change value and check value is updated
    const quantityInput = await screen.findByLabelText(/Quantity/i);
    fireEvent.change(quantityInput, { target: { value: '5' } });
    expect((quantityInput as HTMLInputElement).value).toBe('5');
  });

  test('should be able to enter a description', async () => {
    // find description input and change value and check value is updated
    const descriptionInput = await screen.findByLabelText(/Description/i);
    fireEvent.change(descriptionInput, { target: { value: 'This is a test description' } });
    expect((descriptionInput as HTMLInputElement).value).toBe('This is a test description');
  });

  test('should be able to change markup', async () => {
    // find markup input and change value and check value is updated
    const markupInput = await screen.findByLabelText(/Markup/i);
    fireEvent.change(markupInput, { target: { value: '25' } });
    expect((markupInput as HTMLInputElement).value).toBe('25');
  });

  test('should be able to change VAT rate', async () => {
    // find VAT rate input and change value and check value is updated
    const vatRateInput = await screen.findByLabelText(/VAT Rate/i);
    fireEvent.change(vatRateInput, { target: { value: '15' } });
    expect((vatRateInput as HTMLInputElement).value).toBe('15');
  });

  test('the total value should update when quantity, markup or VAT rate are changed', async () => {
    // select first product
    const selectClientDropdownMenu = await screen.findByRole('combobox');
    fireEvent.click(selectClientDropdownMenu);
    const options = await screen.findAllByRole('option');
    const firstOption = options[0];
    fireEvent.click(firstOption);

    // change quantity
    const quantityInput = await screen.findByLabelText(/Quantity/i);
    fireEvent.change(quantityInput, { target: { value: '2' } });
    expect((quantityInput as HTMLInputElement).value).toBe('2');

    // change markup
    const markupInput = await screen.findByLabelText(/Markup/i);
    fireEvent.change(markupInput, { target: { value: '100' } });
    expect((markupInput as HTMLInputElement).value).toBe('100');

    // change VAT rate
    const vatRateInput = await screen.findByLabelText(/VAT Rate/i);
    fireEvent.change(vatRateInput, { target: { value: '30' } });
    expect((vatRateInput as HTMLInputElement).value).toBe('30');

    screen.debug(document.body, 1000000);

    // check total value is updated correctly
    const totalValueText = await screen.findByText(/Total: £520.00/i);
    expect(totalValueText).toBeInTheDocument();
  });

  test('should close modal when cancel button is clicked', async () => {
    const cancelButton = await screen.findByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({ type: 'CLOSE_ADD_PRODUCT_MODAL' });
    });
  });

  test('should populate markup, value and vat values when a product is selected', async () => {
    // click on drop down menu
    // fireEvent used instead of userEvent due to issues with select component
    const selectClientDropdownMenu = await screen.findByRole('combobox');
    fireEvent.click(selectClientDropdownMenu);

    // select first option
    const options = await screen.findAllByRole('option');
    const firstOption = options[0];
    fireEvent.click(firstOption);

    // check the markup, value and vat inputs are populated correctly
    const markupInput = await screen.findByLabelText(/Markup/i);
    expect((markupInput as HTMLInputElement).value).toBe('100');

    const valueInput = await screen.findByLabelText(/Cost/i);
    expect((valueInput as HTMLInputElement).value).toBe('100');

    const vatRateInput = await screen.findByLabelText(/VAT Rate/i);
    expect((vatRateInput as HTMLInputElement).value).toBe('20');
  });

  test('should be able to click the add product button', async () => {
    // select first product
    const selectClientDropdownMenu = await screen.findByRole('combobox');
    fireEvent.click(selectClientDropdownMenu);
    const options = await screen.findAllByRole('option');
    const firstOption = options[0];
    fireEvent.click(firstOption);

    // click the add product button
    const addProductButton = await screen.findByRole('button', { name: /Add Product/i });
    fireEvent.click(addProductButton);
    expect(addProductButton).toBeInTheDocument();
    expect(addProductButton).not.toBeDisabled();
  });
});
