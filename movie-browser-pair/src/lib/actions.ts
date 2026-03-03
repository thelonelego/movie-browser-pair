'use server'

import { movieStore } from '@/lib/movieStore';
import { NewMovie, MovieResponse, GetMovieListQueryParams } from '@/app/types/movie';
import { Movie } from '@/lib/db/schema';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { filterByYear, sortMovies, paginateMovies } from '@/lib/utils';

const MOVIES_PER_PAGE_DEFAULT = 20;

export async function getMovies(params: GetMovieListQueryParams = {}): Promise<MovieResponse> {
  try {
    const {
      query,
      genre,
      year,
      sort,
      page = 1,
      moviesPerPage = MOVIES_PER_PAGE_DEFAULT
    } = params;

    // Start with all movies or search results
    let filteredMovies = query
      ? await movieStore.searchMovies(query)
      : await movieStore.getAllMovies();

    if (filteredMovies.length === 0) {
      return {
        movies: [],
        page: 1,
        count: 0,
        itemsPerPage: moviesPerPage,
        totalPages: 0
      };
    }

    // Apply filters
    if (genre) {
      filteredMovies = movieStore.filterByGenre(filteredMovies, genre);
    }

    if (year) {
      filteredMovies = filterByYear(filteredMovies, year);
    }

    // Apply sorting
    if (sort) {
      filteredMovies = sortMovies(filteredMovies, sort);
    }

    // Apply pagination
    const result = paginateMovies(filteredMovies, page, moviesPerPage);

    return result;
  } catch (error) {
    console.error('Error in getMovies action:', error);
    throw new Error('Failed to fetch movies');
  }
}

export async function getMovieById(id: number): Promise<Movie | null> {
  try {
    if (isNaN(id)) {
      throw new Error('Invalid movie ID');
    }

    const movie = await movieStore.getMovieById(id);
    return movie || null;
  } catch (error) {
    console.error('Error in getMovieById action:', error);
    throw new Error('Failed to fetch movie');
  }
}

export async function createMovie(newMovie: NewMovie): Promise<Movie> {
  try {
    // Validate required fields
    if (!newMovie.title || !newMovie.year) {
      throw new Error('Title and year are required');
    }

    const movie = await movieStore.addMovie(newMovie);

    revalidatePath('/');
    redirect(`/movies/${movie.id}`);
  } catch (error) {
    console.error('Error in createMovie action:', error);
    throw new Error('Failed to create movie');
  }
}

export async function updateMovie(id: number, updatedMovie: Movie): Promise<Movie | null> {
  try {
    if (isNaN(id)) {
      throw new Error('Invalid movie ID');
    }

    // Ensure the ID matches
    if (updatedMovie.id !== id) {
      throw new Error('Movie ID mismatch');
    }

    // Validate required fields
    if (!updatedMovie.title || !updatedMovie.year) {
      throw new Error('Title and year are required');
    }

    const movie = await movieStore.updateMovie(id, updatedMovie);

    if (!movie) {
      throw new Error('Movie not found');
    }

    revalidatePath('/');
    revalidatePath(`/movies/${id}`);
    redirect(`/movies/${id}`);
  } catch (error) {
    console.error('Error in updateMovie action:', error);
    throw new Error('Failed to update movie');
  }
}

export async function deleteMovie(id: number): Promise<boolean> {
  try {
    if (isNaN(id)) {
      throw new Error('Invalid movie ID');
    }

    const deleted = await movieStore.deleteMovie(id);

    if (!deleted) {
      throw new Error('Movie not found');
    }

    revalidatePath('/');
    redirect('/');
  } catch (error) {
    console.error('Error in deleteMovie action:', error);
    throw new Error('Failed to delete movie');
  }
}