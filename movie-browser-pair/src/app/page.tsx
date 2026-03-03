"use client";

import { useState, useEffect } from 'react';
import { getMovies } from '@/lib/actions';
import { Movie, MovieResponse, GetMovieListQueryParams } from './types/movie';
import Link from 'next/link';
import { Poster } from './components/Poster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';

export default function MovieListPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchMovies = async (params: GetMovieListQueryParams = {}) => {
    try {
      setLoading(true);

      const data: MovieResponse = await getMovies(params);
      setMovies(data.movies);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies({ page: currentPage, query: searchQuery || undefined });
  }, [currentPage, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMovies({ page: 1, query: searchQuery || undefined });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Movie Browser</h1>
        <div className="text-center py-10 text-muted-foreground">Loading movies...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Movie Browser</h1>
        <div className="text-center py-10 text-destructive">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Movie Browser</h1>
        <Button asChild>
          <Link href="/movies/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Movie
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies..."
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {movies.map((movie) => (
          <Link key={movie.id} href={`/movies/${movie.id}`}>
            <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
              <CardContent className="p-4">
                <div className="mb-3">
                  <Poster movie={movie} className="w-32 h-24 object-cover rounded-md mx-auto" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                    {movie.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{movie.year}</p>
                  <div className="flex flex-wrap gap-1">
                    {movie.genres.slice(0, 3).map((genre) => (
                      <Badge key={genre} variant="secondary" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                    {movie.genres.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{movie.genres.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <Button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
