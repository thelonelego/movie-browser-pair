import { describe, it, expect } from 'vitest';
import { filterByYear, sortMovies, paginateMovies } from './utils';
import type { Movie } from '@/lib/db/schema';

function mockMovie(overrides: Partial<Movie> = {}): Movie {
  return {
    id: 1,
    title: 'Test',
    year: 2020,
    rating: 7.5,
    plot: 'Plot',
    posterUrl: null,
    runtime: 90,
    genres: [],
    actors: [],
    directors: [],
    ...overrides,
  };
}

describe('filterByYear', () => {
  it('returns only movies matching the given year', () => {
    const movies: Movie[] = [
      mockMovie({ id: 1, year: 2020 }),
      mockMovie({ id: 2, year: 2021 }),
      mockMovie({ id: 3, year: 2020 }),
    ];
    expect(filterByYear(movies, 2020)).toHaveLength(2);
    expect(filterByYear(movies, 2020).every((m) => m.year === 2020)).toBe(true);
  });

  it('returns empty array when no movies match', () => {
    const movies: Movie[] = [mockMovie({ year: 2020 }), mockMovie({ year: 2021 })];
    expect(filterByYear(movies, 2019)).toEqual([]);
  });
});

describe('sortMovies', () => {
  it('sorts by title ascending', () => {
    const movies: Movie[] = [
      mockMovie({ id: 1, title: 'Zebra' }),
      mockMovie({ id: 2, title: 'Alpha' }),
      mockMovie({ id: 3, title: 'Beta' }),
    ];
    const sorted = sortMovies(movies, 'title');
    expect(sorted.map((m) => m.title)).toEqual(['Alpha', 'Beta', 'Zebra']);
  });

  it('sorts by year descending', () => {
    const movies: Movie[] = [
      mockMovie({ id: 1, year: 2020 }),
      mockMovie({ id: 2, year: 2022 }),
      mockMovie({ id: 3, year: 2021 }),
    ];
    const sorted = sortMovies(movies, 'year');
    expect(sorted.map((m) => m.year)).toEqual([2022, 2021, 2020]);
  });

  it('sorts by rating descending', () => {
    const movies: Movie[] = [
      mockMovie({ id: 1, rating: 5 }),
      mockMovie({ id: 2, rating: 9 }),
      mockMovie({ id: 3, rating: 7 }),
    ];
    const sorted = sortMovies(movies, 'rating');
    expect(sorted.map((m) => m.rating)).toEqual([9, 7, 5]);
  });

  it('returns copy unchanged for unknown sort option', () => {
    const movies: Movie[] = [mockMovie({ id: 1 })];
    const sorted = sortMovies(movies, 'unknown');
    expect(sorted).toHaveLength(1);
    expect(sorted[0].title).toBe('Test');
  });
});

describe('paginateMovies', () => {
  it('returns correct page slice and metadata', () => {
    const movies: Movie[] = Array.from({ length: 25 }, (_, i) =>
      mockMovie({ id: i + 1, title: `Movie ${i + 1}` })
    );
    const result = paginateMovies(movies, 2, 10);
    expect(result.movies).toHaveLength(10);
    expect(result.movies[0].id).toBe(11);
    expect(result.page).toBe(2);
    expect(result.count).toBe(25);
    expect(result.itemsPerPage).toBe(10);
    expect(result.totalPages).toBe(3);
  });

  it('returns empty movies and totalPages 0 when input is empty', () => {
    const result = paginateMovies([], 1, 20);
    expect(result.movies).toEqual([]);
    expect(result.page).toBe(1);
    expect(result.count).toBe(0);
    expect(result.totalPages).toBe(0);
  });
});
