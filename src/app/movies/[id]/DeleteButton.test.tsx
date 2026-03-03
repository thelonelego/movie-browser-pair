import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteButton } from './DeleteButton';
import { deleteMovie } from '@/lib/actions';

vi.mock('@/lib/actions', () => ({
  deleteMovie: vi.fn(),
}));

describe('DeleteButton', () => {
  beforeEach(() => {
    vi.mocked(deleteMovie).mockReset();
  });

  it('shows inline confirmation before delete', async () => {
    vi.mocked(deleteMovie).mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<DeleteButton movieId={1} movieTitle="Test Movie" />);

    await user.click(screen.getByRole('button', { name: /delete movie/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument();
  });

  it('shows inline error when delete fails', async () => {
    vi.mocked(deleteMovie).mockRejectedValue(new Error('DB error'));
    const user = userEvent.setup();

    render(<DeleteButton movieId={1} movieTitle="Test Movie" />);

    await user.click(screen.getByRole('button', { name: /delete movie/i }));
    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/failed to delete movie/i);
      expect(screen.getByRole('alert')).toHaveTextContent(/DB error/i);
    });
  });
});
