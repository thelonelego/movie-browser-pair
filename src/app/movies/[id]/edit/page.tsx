"use client";

import { useState, useEffect, use } from 'react';
import { updateMovie, getMovieById } from '@/lib/actions';
import { Movie } from '@/app/types/movie';
import Link from 'next/link';
import { Poster } from '@/app/components/Poster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, X } from 'lucide-react';

interface EditMoviePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditMoviePage({ params }: EditMoviePageProps) {
  const resolvedParams = use(params);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    year: '',
    runtime: '',
    genres: '',
    director: '',
    actors: '',
    plot: '',
    posterUrl: ''
  });

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const id = parseInt(resolvedParams.id);
        const movieData = await getMovieById(id);

        if (!movieData) {
          throw new Error('Movie not found');
        }

        setMovie(movieData);

        // Populate form
        setFormData({
          title: movieData.title,
          year: movieData.year.toString(),
          runtime: movieData.runtime.toString(),
          genres: movieData.genres.join(', '),
          director: Array.isArray(movieData.directors) ? movieData.directors.join(', ') : movieData.directors,
          actors: Array.isArray(movieData.actors) ? movieData.actors.join(', ') : movieData.actors,
          plot: movieData.plot,
          posterUrl: movieData.posterUrl || ''
        });

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setMovie(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [resolvedParams.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!movie) return;

    setSaving(true);

    try {
      const updatedMovie: Movie = {
        ...movie,
        title: formData.title.trim(),
        year: parseInt(formData.year.trim()),
        runtime: parseInt(formData.runtime.trim()) || 0,
        genres: formData.genres.split(',').map(g => g.trim()).filter(g => g),
        directors: formData.director.split(',').map(d => d.trim()).filter(d => d),
        actors: formData.actors.split(',').map(a => a.trim()).filter(a => a),
        plot: formData.plot.trim(),
        posterUrl: formData.posterUrl.trim() || null
      };

      await updateMovie(movie.id, updatedMovie);
      // The server action will handle the redirect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update movie');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-10 text-muted-foreground">Loading movie...</div>
      </div>
    );
  }

  if (error && !movie) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-10 text-destructive">Error: {error}</div>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Movies
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <Button asChild variant="outline">
          <Link href={`/movies/${resolvedParams.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Movie
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Movie</h1>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="flex gap-8">
        <div className="w-1/3">
          <Card>
            <CardContent className="p-4">
              {movie && <Poster movie={movie} className="w-full h-64 object-cover rounded-md" />}
            </CardContent>
          </Card>
        </div>

        <div className="w-2/3">
          <Card>
            <CardHeader>
              <CardTitle>Movie Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  type="text"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="runtime">Runtime (minutes)</Label>
                <Input
                  type="text"
                  id="runtime"
                  name="runtime"
                  value={formData.runtime}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="director">Director</Label>
                <Input
                  type="text"
                  id="director"
                  name="director"
                  value={formData.director}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="genres">Genres (comma-separated)</Label>
                <Input
                  type="text"
                  id="genres"
                  name="genres"
                  value={formData.genres}
                  onChange={handleInputChange}
                  placeholder="Action, Drama, Comedy"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="actors">Actors</Label>
                <Input
                  type="text"
                  id="actors"
                  name="actors"
                  value={formData.actors}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="posterUrl">Poster URL</Label>
                <Input
                  type="url"
                  id="posterUrl"
                  name="posterUrl"
                  value={formData.posterUrl}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="plot">Plot</Label>
                <Textarea
                  id="plot"
                  name="plot"
                  value={formData.plot}
                  onChange={handleInputChange}
                  rows={5}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button asChild variant="outline">
                <Link href={`/movies/${resolvedParams.id}`}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}