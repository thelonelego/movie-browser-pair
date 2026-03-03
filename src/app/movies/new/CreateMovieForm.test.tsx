import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateMovieForm } from './CreateMovieForm';
import { createMovie } from '@/lib/actions';

vi.mock('@/lib/actions', () => ({
  createMovie: vi.fn(),
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe('CreateMovieForm', () => {
  beforeEach(() => {
    vi.mocked(createMovie).mockReset();
  });

  it('shows "Please enter a valid year" when year is non-numeric', async () => {
    const user = userEvent.setup();
    render(<CreateMovieForm />);

    await user.type(screen.getByLabelText(/title/i), 'Valid Title');
    await user.type(screen.getByLabelText(/year/i), 'abc');
    await user.click(screen.getByRole('button', { name: /create movie/i }));

    expect(screen.getByText(/please enter a valid year/i)).toBeInTheDocument();
    expect(createMovie).not.toHaveBeenCalled();
  });

  it('shows "Year is required" when year is empty', async () => {
    const user = userEvent.setup();
    render(<CreateMovieForm />);

    await user.type(screen.getByLabelText(/title/i), 'Valid Title');
    await user.click(screen.getByRole('button', { name: /create movie/i }));

    await waitFor(() => {
      expect(screen.getByText(/year is required/i)).toBeInTheDocument();
    });
    expect(createMovie).not.toHaveBeenCalled();
  });
});
