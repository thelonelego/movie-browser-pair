'use client'

import { useState } from 'react';
import { createMovie } from '@/lib/actions';
import { NewMovie } from '@/app/types/movie';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';

export function CreateMovieForm() {
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
      const yearNum = parseInt(formData.year.trim(), 10);
      const newMovie: NewMovie = {
        title: formData.title.trim(),
        year: Number.isNaN(yearNum) ? 0 : yearNum,
        runtime: parseInt(formData.runtime.trim(), 10) || 0,
        genres: formData.genres.split(',').map(g => g.trim()).filter(g => g),
        directors: formData.director.split(',').map(d => d.trim()).filter(d => d),
        actors: formData.actors.split(',').map(a => a.trim()).filter(a => a),
        plot: formData.plot.trim(),
        posterUrl: formData.posterUrl.trim() || null,
        rating: 0
      };

      if (!newMovie.title) {
        throw new Error('Title is required');
      }
      const yearTrimmed = formData.year.trim();
      if (!yearTrimmed) {
        throw new Error('Year is required');
      }
      if (Number.isNaN(yearNum) || yearNum < 1) {
        throw new Error('Please enter a valid year');
      }

      await createMovie(newMovie);
      // The server action will handle the redirect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create movie');
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

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
            <Plus className="mr-2 h-4 w-4" />
            {saving ? 'Creating...' : 'Create Movie'}
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Link>
          </Button>
        </div>
      </form>
    </>
  );
}