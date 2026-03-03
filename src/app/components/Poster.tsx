'use client'

import type { Movie } from '@/app/types/movie';
import { cn } from '@/lib/utils';

type Props = {
  movie: Movie;
  className?: string;
};

export function Poster({ movie, className }: Props) {
  const placeholderUrl = '/placeholder-poster.png';
  
  return (
    <img
      src={!movie.posterUrl ? placeholderUrl : movie.posterUrl}
      alt={`${movie.title} poster`}
      className={cn("rounded-md", className)}
      onError={(e) => {
        (e.target as HTMLImageElement).src = placeholderUrl;
      }}
    />
  );
}