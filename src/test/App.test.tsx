import AddClient from '@/components/addClient/addClient';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('App', () => {
  it('renders welcome message', () => {
    render(<AddClient />);
    expect(screen.getByText('Add Client')).toBeInTheDocument();
  });
});
