import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { CreateMovieForm } from './CreateMovieForm';

export default function NewMoviePage() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Movies
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Add New Movie</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movie Information</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateMovieForm />
        </CardContent>
      </Card>
    </div>
  );
}