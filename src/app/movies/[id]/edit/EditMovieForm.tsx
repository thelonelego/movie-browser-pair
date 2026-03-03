'use client'

import { useState } from 'react';
import { updateMovie } from '@/lib/actions';
import { Movie } from '@/app/types/movie';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, X } from 'lucide-react';

interface EditMovieFormProps {
  movie: Movie;
}

export function EditMovieForm({ movie }: EditMovieFormProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: movie.title,
    year: movie.year.toString(),
    runtime: movie.runtime.toString(),
    genres: movie.genres.join(', '),
    director: Array.isArray(movie.directors) ? movie.directors.join(', ') : movie.directors,
    actors: Array.isArray(movie.actors) ? movie.actors.join(', ') : movie.actors,
    plot: movie.plot,
    posterUrl: movie.posterUrl || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    setError(null);

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

  return (
    <>
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

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
            <Link href={`/movies/${movie.id}`}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Link>
          </Button>
        </div>
      </form>
    </>
  );
}