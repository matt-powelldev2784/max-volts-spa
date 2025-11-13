import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { TestProviders } from '@/test/testProviders';
import AddClient from '../addClient';

vi.mock('@/lib/supabase', async () => {
  const { createSupabaseMock } = await import('@/test/supabaseMock');
  return createSupabaseMock();
});

describe('Add Client with data fetch success', () => {
  test('should be able to select an option from the dropdown menu', async () => {
    const dispatch = vi.fn();

    render(
      <TestProviders>
        <AddClient clientId={0} dispatch={dispatch} />
      </TestProviders>
    );

    // click on drop down menu
    // fireEvent used instead of userEvent due to issues with select component
    const selectClientDropdownMenu = await screen.findByRole('combobox');
    await waitFor(() => expect(selectClientDropdownMenu).not.toBeDisabled());
    fireEvent.click(selectClientDropdownMenu);

    // select first option
    const options = await screen.findAllByRole('option');
    const firstOption = options[0];
    expect(firstOption).toHaveTextContent(/Test Client Test Company/i);
    fireEvent.click(firstOption);

    // check the selected option is shown in the select trigger
    await waitFor(() => {
      expect(selectClientDropdownMenu).toHaveTextContent(/Test Client Test Company/i);
    });
  });

  test('should be set the client if a client Id is passed in', async () => {
    const dispatch = vi.fn();

    render(
      <TestProviders>
        <AddClient clientId={1} dispatch={dispatch} />
      </TestProviders>
    );

    // check the selected option is shown in the select trigger
    const selectClientDropdownMenu = await screen.findByRole('combobox');
    await waitFor(() => {
      expect(selectClientDropdownMenu).toHaveTextContent(/Test Client Test Company/i);
    });
  });

  test('should set the client id and step on form submit', async () => {
    const dispatch = vi.fn();

    render(
      <TestProviders>
        <AddClient clientId={0} dispatch={dispatch} />
      </TestProviders>
    );

    // select first option
    // fireEvent used instead of userEvent due to issues with select component
    const selectClientDropdownMenu = await screen.findByRole('combobox');
    fireEvent.click(selectClientDropdownMenu);
    const options = await screen.findAllByRole('option');
    const firstOption = options[0];
    fireEvent.click(firstOption);

    // submit form
    const submitButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({ type: 'SET_CLIENT_ID', clientId: 1 });
      expect(dispatch).toHaveBeenCalledWith({ type: 'SET_STEP', step: 'AddProducts' });
    });
  });
});


