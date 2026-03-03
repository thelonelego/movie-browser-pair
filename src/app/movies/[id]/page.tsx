import { getMovieById } from '@/lib/actions';
import Link from 'next/link';
import { Poster } from '@/app/components/Poster';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit } from 'lucide-react';
import { DeleteButton } from './DeleteButton';

interface MovieDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);

  if (isNaN(id)) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-10 text-destructive">Error: Invalid movie ID</div>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Movies
          </Link>
        </Button>
      </div>
    );
  }

  const movie = await getMovieById(id);

  if (!movie) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-10 text-destructive">Error: Movie not found</div>
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
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Movies
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/movies/${movie.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Movie
            </Link>
          </Button>
          <DeleteButton movieId={movie.id} movieTitle={movie.title} />
        </div>
      </div>

      <div className="flex gap-8">
        <div className="w-1/3">
          <Card>
            <CardContent className="p-4">
              <Poster movie={movie} className="w-full h-64 object-cover rounded-md" />
            </CardContent>
          </Card>
        </div>
        
        <div className="w-2/3 space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres.map((genre) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Movie Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Year</p>
                  <p className="text-lg">{movie.year}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Runtime</p>
                  <p className="text-lg">{movie.runtime} minutes</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Director</p>
                <p className="text-lg">{Array.isArray(movie.directors) ? movie.directors.join(', ') : movie.directors}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Cast</p>
                <p className="text-lg">{Array.isArray(movie.actors) ? movie.actors.join(', ') : movie.actors}</p>
              </div>
            </CardContent>
          </Card>

          {movie.plot && (
            <Card>
              <CardHeader>
                <CardTitle>Plot</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-relaxed">{movie.plot}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}