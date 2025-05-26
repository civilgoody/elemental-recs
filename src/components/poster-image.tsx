import Image from 'next/image';
import { Film, Tv } from 'lucide-react';
import { TMDBSearchResult } from '@/lib/types';

interface PosterImageProps {
  item: TMDBSearchResult;
  size: 'sm' | 'md';
  className?: string;
}

export function PosterImage({ item, size, className = '' }: PosterImageProps) {
  const dimensions = size === 'sm' 
    ? { width: 40, height: 56, iconSize: 'w-4 h-4' }
    : { width: 48, height: 72, iconSize: 'w-5 h-5' };

  const title = item.title || item.name || '';

  if (item.poster_path) {
    return (
      <div className={`flex-shrink-0 bg-muted rounded overflow-hidden ${className}`} 
           style={{ width: dimensions.width, height: dimensions.height }}>
        <Image
          src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
          alt={`${title} poster`}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback when no poster
  return (
    <div className={`flex-shrink-0 bg-muted rounded flex items-center justify-center ${className}`} 
         style={{ width: dimensions.width, height: dimensions.height }}>
      {item.media_type === 'movie' ? (
        <Film className={`text-muted-foreground ${dimensions.iconSize}`} />
      ) : (
        <Tv className={`text-muted-foreground ${dimensions.iconSize}`} />
      )}
    </div>
  );
} 
