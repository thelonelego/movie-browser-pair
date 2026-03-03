export interface Movie {
  id: number;
  title: string;
  year: number;
  runtime: number;
  genres: string[];
  directors: string[];
  actors: string[];
  plot: string;
  posterUrl: string | null;
  rating: number;
}

export interface NewMovie extends Omit<Movie, 'id'> {
  id?: number;
}

export interface MovieResponse {
  movies: Movie[];
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