'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, ChevronsUpDown } from 'lucide-react';
import { TMDBSearchResult } from '@/lib/types';
import { PosterImage } from '@/components/poster-image';
import { MediaInfo } from '@/components/media-info';

interface MovieSearchInputProps {
  label: string;
  placeholder: string;
  value: TMDBSearchResult | null;
  onChange: (value: TMDBSearchResult | null) => void;
  disabled?: boolean;
}

export function MovieSearchInput({ label, placeholder, value, onChange, disabled }: MovieSearchInputProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TMDBSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (result: TMDBSearchResult) => {
    onChange(result);
    setOpen(false);
    setQuery('');
  };

  const handleClear = () => {
    onChange(null);
    setQuery('');
  };

  // If a value is selected, show the selection
  if (value) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <div className="flex items-center gap-3 p-3 border border-border rounded-md bg-muted/50">
          <PosterImage item={value} size="sm" />
          <MediaInfo item={value} variant="detailed" showFullTitle />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
            className="h-6 w-6 p-0 flex-shrink-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto p-3 font-normal"
            disabled={disabled}
          >
            <span className="text-muted-foreground">{placeholder}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Type to search movies and TV shows..."
              value={query}
              onValueChange={setQuery}
            />
            
            <CommandList className="max-h-64">
              {isLoading && (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </div>
                </div>
              )}

              {!isLoading && query.length >= 2 && results.length === 0 && (
                <CommandEmpty>No movies or TV shows found for &#34;{query}&#34;</CommandEmpty>
              )}

              {results.length > 0 && (
                <CommandGroup>
                  {results.map((result) => (
                    <CommandItem
                      key={result.id}
                      value={result.id.toString()}
                      onSelect={() => handleSelect(result)}
                      className="p-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <PosterImage item={result} size="md" />
                        <MediaInfo item={result} variant="compact" />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
} 
