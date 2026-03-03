/**
 * Single source of truth for movie types used across the app.
 * Movie and NewMovie are re-exported from the DB schema so UI and data layer stay in sync.
 */
export type { Movie, NewMovie } from '@/lib/db/schema';

export interface MovieResponse {
  movies: import('@/lib/db/schema').Movie[];
  page: number;
  count: number;
  itemsPerPage: number;
  totalPages: number;
}

export interface GetMovieListQueryParams {
  query?: string;
  genre?: string;
  year?: number;
  sort?: string;
  page?: number;
  moviesPerPage?: number;
}
