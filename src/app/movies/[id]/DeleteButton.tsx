'use client'

import { useState } from 'react';
import { deleteMovie } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface DeleteButtonProps {
  movieId: number;
  movieTitle: string;
}

export function DeleteButton({ movieId, movieTitle }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${movieTitle}"?`)) {
      return;
    }

    setError(null);
    setIsDeleting(true);
    try {
      await deleteMovie(movieId);
      // The server action will handle the redirect
    } catch (err) {
      setError('Failed to delete movie: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <Button onClick={handleDelete} variant="destructive" disabled={isDeleting}>
        <Trash2 className="mr-2 h-4 w-4" />
        {isDeleting ? 'Deleting...' : 'Delete Movie'}
      </Button>
    </div>
  );
}