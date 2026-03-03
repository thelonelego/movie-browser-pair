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

  it('keeps header and search visible while loading', async () => {
    let resolvePromise: (value: unknown) => void;
    vi.mocked(getMovies).mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve; })
    );

    render(<MovieListPage />);

    expect(screen.getByRole('heading', { name: /movie browser/i })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: /search movies by title/i })).toBeInTheDocument();
    expect(screen.getByText(/loading movies/i)).toBeInTheDocument();

    resolvePromise!({
      movies: [],
      page: 1,
      count: 0,
      itemsPerPage: 20,
      totalPages: 0,
    });
    await waitFor(() => {
      expect(screen.getByText(/no movies found/i)).toBeInTheDocument();
    });
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

  it('search input has accessible label', async () => {
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

    const searchInput = screen.getByRole('searchbox', { name: /search movies by title/i });
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('aria-label', 'Search movies by title');
  });

  it('submitting search calls getMovies with query', async () => {
    vi.mocked(getMovies)
      .mockResolvedValueOnce({
        movies: [],
        page: 1,
        count: 0,
        itemsPerPage: 20,
        totalPages: 0,
      })
      .mockResolvedValueOnce({
        movies: [],
        page: 1,
        count: 0,
        itemsPerPage: 20,
        totalPages: 0,
      });

    const user = userEvent.setup();
    render(<MovieListPage />);

    await waitFor(() => {
      expect(getMovies).toHaveBeenCalledWith({ page: 1, query: undefined });
    });

    const searchbox = screen.getByRole('searchbox', { name: /search movies by title/i });
    await user.clear(searchbox);
    await user.paste('drama');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(getMovies).toHaveBeenLastCalledWith({ page: 1, query: 'drama' });
    });
  });
});
