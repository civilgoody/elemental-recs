'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ANIMATED_BLUR_DATA_URL } from '@/lib/constants';

interface OptimizedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  uniqueKey?: string; // For forcing re-render on carousel changes
}

export function OptimizedImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  loading = 'lazy',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  uniqueKey,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  return (
    <Image
      key={uniqueKey} // Force re-render when key changes
      src={src}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={`${className} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      loading={loading}
      sizes={sizes}
      placeholder="blur"
      blurDataURL={ANIMATED_BLUR_DATA_URL}
      onLoad={handleLoad}
      onLoadStart={handleLoadStart}
    />
  );
} 
