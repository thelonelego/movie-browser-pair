import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Movie } from '@/lib/db/schema';
import { MovieResponse } from '@/app/types/movie';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const MOVIES_PER_PAGE_DEFAULT = 20;

// Movie utility functions
export function filterByYear(movies: Movie[], year: number): Movie[] {
  return movies.filter(m => parseInt(m.year.toString()) === year);
}

export function sortMovies(movies: Movie[], sortOption: string): Movie[] {
  const moviesCopy = [...movies];

  switch (sortOption.toLowerCase()) {
    case 'title':
      return moviesCopy.sort((a, b) => a.title.localeCompare(b.title));
    case 'year':
      return moviesCopy.sort((a, b) => parseInt(b.year.toString()) - parseInt(a.year.toString()));
    case 'rating':
      return moviesCopy.sort((a, b) => b.rating - a.rating);
    default:
      return moviesCopy;
  }
}

export function paginateMovies(movies: Movie[], page: number, itemsPerPage: number = MOVIES_PER_PAGE_DEFAULT): MovieResponse {
  const totalMovies = movies.length;
  const totalPages = Math.ceil(totalMovies / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedMovies = movies.slice(startIndex, endIndex);

  return {
    movies: paginatedMovies,
    page: page,
    count: totalMovies,
    itemsPerPage: itemsPerPage,
    totalPages: totalPages
  };
}
