'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Film, Tv, Search, X, Check } from 'lucide-react';
import { TMDBSearchResult } from '@/lib/types';

interface MovieSearchInputProps {
  label: string;
  placeholder: string;
  value: TMDBSearchResult | null;
  onChange: (value: TMDBSearchResult | null) => void;
  disabled?: boolean;
}

export function MovieSearchInput({ label, placeholder, value, onChange, disabled }: MovieSearchInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TMDBSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.results || []);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: TMDBSearchResult) => {
    onChange(result);
    setQuery('');
    setIsOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    onChange(null);
    setQuery('');
    setIsOpen(false);
    setResults([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const formatTitle = (result: TMDBSearchResult) => {
    const title = result.title || result.name || '';
    const year = result.display_year;
    return year ? `${title} (${year})` : title;
  };

  // If a value is selected, show the selection
  if (value) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <div className="flex items-center gap-2 p-3 border border-border rounded-md bg-muted/50">
          <div className="flex items-center gap-2 flex-1">
            {value.media_type === 'movie' ? (
              <Film className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Tv className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="font-medium">{formatTitle(value)}</span>
            <Badge variant="secondary" className="text-xs">
              {value.media_type === 'movie' ? 'Movie' : 'TV Show'}
            </Badge>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
            className="h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 relative">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <div className="relative">
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            disabled={disabled}
            className="pr-8"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50" />
            ) : (
              <Search className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Results dropdown */}
        {isOpen && results.length > 0 && (
          <div
            ref={resultsRef}
            className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-64 overflow-y-auto"
          >
            {results.map((result, index) => (
              <button
                key={result.id}
                type="button"
                className={`w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2 ${
                  index === selectedIndex ? 'bg-accent text-accent-foreground' : ''
                }`}
                onClick={() => handleSelect(result)}
              >
                {result.media_type === 'movie' ? (
                  <Film className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <Tv className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{formatTitle(result)}</div>
                  {result.original_language && result.original_language !== 'en' && (
                    <div className="text-xs text-muted-foreground">
                      {result.original_language.toUpperCase()}
                    </div>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  {result.media_type === 'movie' ? 'Movie' : 'TV Show'}
                </Badge>
              </button>
            ))}
          </div>
        )}

        {/* No results message */}
        {isOpen && !isLoading && query.length >= 2 && results.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg p-3 text-center text-muted-foreground text-sm">
            No movies or TV shows found for &#34;{query}&#34;
          </div>
        )}
      </div>
    </div>
  );
} 
