import { NextRequest, NextResponse } from 'next/server';
import { getMovieById } from '@/lib/actions';
import { movieStore } from '@/lib/movieStore';
import { revalidatePath } from 'next/cache';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const movieId = parseInt(id, 10);
    if (isNaN(movieId)) {
      return NextResponse.json(
        { error: 'Invalid movie ID' },
        { status: 400 }
      );
    }
    const movie = await getMovieById(movieId);
    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(movie);
  } catch (error) {
    console.error('GET /api/movies/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movie' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const movieId = parseInt(id, 10);
    if (isNaN(movieId)) {
      return NextResponse.json(
        { error: 'Invalid movie ID' },
        { status: 400 }
      );
    }
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be a JSON object' },
        { status: 400 }
      );
    }
    const update: Record<string, unknown> = {};
    if (body.title !== undefined) update.title = String(body.title);
    if (body.year !== undefined) update.year = Number(body.year);
    if (body.runtime !== undefined) update.runtime = Number(body.runtime);
    if (body.rating !== undefined) update.rating = Number(body.rating);
    if (body.plot !== undefined) update.plot = String(body.plot);
    if (body.posterUrl !== undefined) update.posterUrl = body.posterUrl == null ? null : String(body.posterUrl);
    if (body.genres !== undefined) update.genres = Array.isArray(body.genres) ? body.genres.map(String) : [];
    if (body.actors !== undefined) update.actors = Array.isArray(body.actors) ? body.actors.map(String) : [];
    if (body.directors !== undefined) update.directors = Array.isArray(body.directors) ? body.directors.map(String) : [];

    const movie = await movieStore.updateMovie(movieId, update);
    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }
    revalidatePath('/');
    revalidatePath(`/movies/${movieId}`);
    return NextResponse.json(movie);
  } catch (error) {
    console.error('PUT /api/movies/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update movie' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const movieId = parseInt(id, 10);
    if (isNaN(movieId)) {
      return NextResponse.json(
        { error: 'Invalid movie ID' },
        { status: 400 }
      );
    }
    const deleted = await movieStore.deleteMovie(movieId);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }
    revalidatePath('/');
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('DELETE /api/movies/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete movie' },
      { status: 500 }
    );
  }
}
