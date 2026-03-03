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
    window.confirm = vi.fn(() => true);
  });

  it('shows inline error when delete fails', async () => {
    vi.mocked(deleteMovie).mockRejectedValue(new Error('DB error'));
    const user = userEvent.setup();

    render(<DeleteButton movieId={1} movieTitle="Test Movie" />);

    await user.click(screen.getByRole('button', { name: /delete movie/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/failed to delete movie/i);
      expect(screen.getByRole('alert')).toHaveTextContent(/DB error/i);
    });
  });
});
