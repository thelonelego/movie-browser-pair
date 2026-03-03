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

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${movieTitle}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteMovie(movieId);
      // The server action will handle the redirect
    } catch (error) {
      alert('Failed to delete movie: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setIsDeleting(false);
    }
  };

  return (
    <Button onClick={handleDelete} variant="destructive" disabled={isDeleting}>
      <Trash2 className="mr-2 h-4 w-4" />
      {isDeleting ? 'Deleting...' : 'Delete Movie'}
    </Button>
  );
}