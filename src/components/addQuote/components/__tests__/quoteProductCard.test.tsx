import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { QuoteProductCard } from '../quoteProductCard';
import userEvent from '@testing-library/user-event';
import { beforeEach } from 'node:test';
import { defaultRecords } from '@/test/supabaseMock';
import { TestProviders } from '@/test/testProviders';

const onEditProduct = vi.fn();
const onRemoveProduct = vi.fn();
const user = userEvent.setup();

describe('QuoteProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should display product name, quantity, and total value', () => {
    render(
      <TestProviders>
        <QuoteProductCard
          product={defaultRecords.quote_product[0]}
          onEditProduct={onEditProduct}
          onRemoveProduct={onRemoveProduct}
        />
      </TestProviders>
    );

    expect(screen.getByText(/1 x Test Product/i)).toBeInTheDocument();
    expect(screen.getByText(/£ 124.00/i)).toBeInTheDocument();
  });

  test('should display product description', () => {
    render(
      <TestProviders>
        <QuoteProductCard
          product={defaultRecords.quote_product[0]}
          onEditProduct={onEditProduct}
          onRemoveProduct={onRemoveProduct}
        />
      </TestProviders>
    );

    expect(screen.getByText(/Description for test product/i)).toBeInTheDocument();
  });

  test('should call onEditProduct when Edit is clicked', async () => {
    render(
      <TestProviders>
        <QuoteProductCard
          product={defaultRecords.quote_product[0]}
          onEditProduct={onEditProduct}
          onRemoveProduct={onRemoveProduct}
        />
      </TestProviders>
    );

    const triggerButton = screen.getByRole('button', { name: /Product actions/i });
    await user.click(triggerButton);

    const editItem = screen.getByText(/Edit/i);
    await user.click(editItem);

    expect(onEditProduct).toHaveBeenCalledTimes(1);
  });

  test('should call onRemoveProduct when Remove is clicked', async () => {
    render(
      <TestProviders>
        <QuoteProductCard
          product={defaultRecords.quote_product[0]}
          onEditProduct={onEditProduct}
          onRemoveProduct={onRemoveProduct}
        />
      </TestProviders>
    );

    const triggerButton = screen.getByRole('button', { name: /Product actions/i });
    await user.click(triggerButton);

    const removeItem = screen.getByText(/Remove/i);
    await user.click(removeItem);

    expect(onRemoveProduct).toHaveBeenCalledTimes(1);
  });

  test('should disable actions when disabled prop is true', async () => {
    render(
      <QuoteProductCard
        product={defaultRecords.quote_product[0]}
        onEditProduct={onEditProduct}
        onRemoveProduct={onRemoveProduct}
        disabled={true}
      />
    );
    const triggerButton = screen.getByRole('button', { name: /Product actions/i });
    expect(triggerButton).toBeDisabled();
  });
});
