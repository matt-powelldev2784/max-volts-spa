import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import AddQuote from '../addQuote';
import { TestProviders } from '@/test/testProviders';
import userEvent from '@testing-library/user-event';

vi.mock('@/lib/supabase', async () => {
  const { createSupabaseMock } = await import('@/test/supabaseMock');
  return createSupabaseMock();
});

describe('addQuote', () => {
  test('should render add client component', async () => {
    render(
      <TestProviders>
        <AddQuote />
      </TestProviders>
    );
    expect(await screen.findByText(/Select a client/i)).toBeInTheDocument();
  });

  test('user should be able to select a client and click next', async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <AddQuote />
      </TestProviders>
    );

    // click the select client dropdown
    // fireEvent used instead of userEvent due to issues with select component
    const selectClientDropdownMenu = await screen.findByRole('combobox');
    fireEvent.click(selectClientDropdownMenu);

    // select a client from the dropdown and check that it is selected
    // fireEvent used instead of userEvent due to issues with select component
    const testClientOption = await screen.findByRole('option', { name: /Test Client Test Company/i });
    fireEvent.click(testClientOption);

    waitFor(() => {
      expect(selectClientDropdownMenu).toHaveTextContent(/Test Client Test Company/i);
    });

    // click the next button and check that the add products step is rendered
    const nextButton = screen.getByRole('button', { name: /Next Step/i });
    await user.click(nextButton);
    expect(await screen.findByText(/No products added./i)).toBeInTheDocument();
  });

  test('user should be able to select a client, navigate to add products step and navigate back to add client step', async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <AddQuote />
      </TestProviders>
    );

    // select a client
    // fireEvent used instead of userEvent due to issues with select component
    const selectClientDropdownMenu = await screen.findByRole('combobox');
    fireEvent.click(selectClientDropdownMenu);

    // select a client from the dropdown and check that it is selected
    // fireEvent used instead of userEvent due to issues with select component
    const testClientOption = await screen.findByRole('option', { name: /Test Client Test Company/i });
    fireEvent.click(testClientOption);
    waitFor(() => {
      expect(selectClientDropdownMenu).toHaveTextContent(/Test Client Test Company/i);
    });

    // click the next button and check that the add products step is rendered
    const nextButton = screen.getByRole('button', { name: /Next Step/i });
    await user.click(nextButton);
    expect(await screen.findByText(/No products added./i)).toBeInTheDocument();

    // click the back button and check that the add client step is rendered
    const backButton = screen.getByRole('button', { name: /Back/i });
    await user.click(backButton);
    expect(await screen.findByText(/Select a client/i)).toBeInTheDocument();
  });

  test('user should be able to navigate to back and the client should still be selected', async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <AddQuote />
      </TestProviders>
    );

    // select a client
    // fireEvent used instead of userEvent due to issues with select component
    const selectClientDropdownMenu = screen.getByRole('combobox');
    fireEvent.click(selectClientDropdownMenu);

    // select a client from the dropdown and check that it is selected
    // fireEvent used instead of userEvent due to issues with select component
    const testClientOption = await screen.findByRole('option', { name: /Test Client Test Company/i });
    fireEvent.click(testClientOption);
    waitFor(() => {
      expect(selectClientDropdownMenu).toHaveTextContent(/Test Client Test Company/i);
    });

    // click the next button and check that the add products step is rendered
    const nextButton = screen.getByRole('button', { name: /Next Step/i });
    await user.click(nextButton);
    expect(await screen.findByText(/No products added./i)).toBeInTheDocument();

    // click the back button and check that the add client step is rendered
    const backButton = screen.getByRole('button', { name: /Back/i });
    await user.click(backButton);
    expect(await screen.findByText(/Select a client/i)).toBeInTheDocument();

    screen.debug(document.body, 10000);

    const selectClientDropdownMenuAfterNavigate = screen.getByRole('combobox');
    expect(selectClientDropdownMenuAfterNavigate).toHaveTextContent(/Test Client Test Company/i);
  });
}); 

  
