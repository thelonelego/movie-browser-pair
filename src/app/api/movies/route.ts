import { NextRequest, NextResponse } from 'next/server';
import { getMovies } from '@/lib/actions';
import { movieStore } from '@/lib/movieStore';
import { revalidatePath } from 'next/cache';
import type { GetMovieListQueryParams } from '@/app/types/movie';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params: GetMovieListQueryParams = {};
    const query = searchParams.get('query') ?? undefined;
    if (query) params.query = query;
    const genre = searchParams.get('genre') ?? undefined;
    if (genre) params.genre = genre;
    const yearParam = searchParams.get('year');
    if (yearParam !== null && yearParam !== '') {
      const year = parseInt(yearParam, 10);
      if (!isNaN(year)) params.year = year;
    }
    const sort = searchParams.get('sort') ?? undefined;
    if (sort) params.sort = sort;
    const pageParam = searchParams.get('page');
    if (pageParam !== null && pageParam !== '') {
      const page = parseInt(pageParam, 10);
      if (!isNaN(page) && page >= 1) params.page = page;
    }
    const moviesPerPageParam = searchParams.get('moviesPerPage');
    if (moviesPerPageParam !== null && moviesPerPageParam !== '') {
      const moviesPerPage = parseInt(moviesPerPageParam, 10);
      if (!isNaN(moviesPerPage) && moviesPerPage >= 1) params.moviesPerPage = moviesPerPage;
    }

    const data = await getMovies(params);
    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/movies error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be a JSON object' },
        { status: 400 }
      );
    }
    if (!body.title || body.year == null) {
      return NextResponse.json(
        { error: 'Title and year are required' },
        { status: 400 }
      );
    }
    const newMovie = {
      title: String(body.title),
      year: Number(body.year),
      runtime: body.runtime != null ? Number(body.runtime) : 0,
      genres: Array.isArray(body.genres) ? body.genres.map(String) : [],
      directors: Array.isArray(body.directors) ? body.directors.map(String) : [],
      actors: Array.isArray(body.actors) ? body.actors.map(String) : [],
      plot: body.plot != null ? String(body.plot) : '',
      posterUrl: body.posterUrl != null ? String(body.posterUrl) : null,
      rating: body.rating != null ? Number(body.rating) : 0,
    };
    const movie = await movieStore.addMovie(newMovie);
    revalidatePath('/');
    return NextResponse.json(movie, { status: 201 });
  } catch (error) {
    console.error('POST /api/movies error:', error);
    return NextResponse.json(
      { error: 'Failed to create movie' },
      { status: 500 }
    );
  }
}
