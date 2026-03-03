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
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteClick = () => {
    setError(null);
    setShowConfirm(true);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  const handleConfirmDelete = async () => {
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
      {showConfirm ? (
        <div className="flex flex-wrap items-center gap-2" role="dialog" aria-labelledby="delete-confirm-heading" aria-describedby="delete-confirm-desc">
          <span id="delete-confirm-heading" className="sr-only">Confirm delete</span>
          <p id="delete-confirm-desc" className="text-sm">
            Are you sure you want to delete &quot;{movieTitle}&quot;?
          </p>
          <Button type="button" variant="outline" size="sm" onClick={handleCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" size="sm" onClick={handleConfirmDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      ) : (
        <Button onClick={handleDeleteClick} variant="destructive" disabled={isDeleting}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Movie
        </Button>
      )}
    </div>
  );
}