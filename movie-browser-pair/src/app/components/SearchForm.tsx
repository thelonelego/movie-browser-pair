'use client'

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export function SearchForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (searchQuery.trim()) {
      params.set('query', searchQuery.trim());
    } else {
      params.delete('query');
    }

    params.set('page', '1'); // Reset to first page on new search

    router.push(`/?${params.toString()}`);
  };

  return (
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
  );
}