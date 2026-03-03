import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MovieListPage from './page';
import { getMovies } from '@/lib/actions';

vi.mock('@/lib/actions', () => ({
  getMovies: vi.fn(),
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe('MovieListPage', () => {
  beforeEach(() => {
    vi.mocked(getMovies).mockReset();
  });

  it('shows empty state when no movies are returned', async () => {
    vi.mocked(getMovies).mockResolvedValue({
      movies: [],
      page: 1,
      count: 0,
      itemsPerPage: 20,
      totalPages: 0,
    });

    render(<MovieListPage />);

    await waitFor(() => {
      expect(getMovies).toHaveBeenCalled();
    });

    expect(screen.getByText(/No movies found/i)).toBeInTheDocument();
  });

  it('shows movie grid when movies are returned', async () => {
    vi.mocked(getMovies).mockResolvedValue({
      movies: [
        {
          id: 1,
          title: 'Test Movie',
          year: 2020,
          runtime: 90,
          genres: ['Drama'],
          directors: [],
          actors: [],
          plot: 'Plot',
          posterUrl: null,
          rating: 7,
        },
      ],
      page: 1,
      count: 1,
      itemsPerPage: 20,
      totalPages: 1,
    });

    render(<MovieListPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
  });
});
