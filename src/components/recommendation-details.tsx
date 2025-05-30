import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Film, Tv, Calendar, Globe, Languages } from 'lucide-react';
import { OptimizedImage } from '@/components/optimized-image';
import { RatingDisplay } from '@/components/rating-display';
import { Recommendation } from '@/lib/types';

interface RecommendationDetailsProps {
  recommendation: Recommendation;
  index: number;
}

export function RecommendationDetails({ recommendation, index }: RecommendationDetailsProps) {
  const getElementColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    ];
    return colors[index % colors.length];
  };

  // Use higher resolution images for the sheet
  const posterUrl = recommendation.poster_path 
    ? `https://image.tmdb.org/t/p/w500${recommendation.poster_path}`
    : null;
  
  const backdropUrl = recommendation.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${recommendation.backdrop_path}`
    : null;

  // Create unique keys for images to force re-render on carousel changes
  const backdropKey = `backdrop-${recommendation.tmdb_id || recommendation.title}-${index}`;
  const posterKey = `poster-${recommendation.tmdb_id || recommendation.title}-${index}`;

  return (
    <div className="space-y-6">
      {/* Hero Section with Backdrop */}
      {backdropUrl && (
        <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden">
          <OptimizedImage
            src={backdropUrl}
            alt={`${recommendation.title} backdrop`}
            fill
            className="object-cover"
            uniqueKey={backdropKey}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              {recommendation.title}
            </h2>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className={getElementColor(index)}>
                {recommendation.type === 'Movie' ? <Film className="w-3 h-3 mr-1" /> : <Tv className="w-3 h-3 mr-1" />}
                {recommendation.type}
              </Badge>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Poster */}
        {posterUrl && (
          <div className="flex-shrink-0">
            <div className="relative w-32 h-48 sm:w-40 sm:h-60 rounded-lg overflow-hidden mx-auto sm:mx-0">
              <OptimizedImage
                src={posterUrl}
                alt={`${recommendation.title} poster`}
                fill
                className="object-cover"
                uniqueKey={posterKey}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 space-y-4">
          {/* Title if no backdrop */}
          {!backdropUrl && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {recommendation.title}
              </h2>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className={getElementColor(index)}>
                  {recommendation.type === 'Movie' ? <Film className="w-3 h-3 mr-1" /> : <Tv className="w-3 h-3 mr-1" />}
                  {recommendation.type}
                </Badge>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{recommendation.year}</span>
            </div>
            
            {/* Rating */}
            <RatingDisplay 
              rating={recommendation.vote_average} 
              voteCount={recommendation.vote_count}
              size="md"
              showVoteCount={true}
            />
            
            {recommendation.country && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="w-4 h-4" />
                <span>{recommendation.country}</span>
              </div>
            )}
            
            {recommendation.original_language && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Languages className="w-4 h-4" />
                <span>{recommendation.original_language.toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* Full Reasoning */}
          <div>
            <h3 className="font-semibold text-foreground mb-2">Why You&apos;ll Love This:</h3>
            <p className="text-sm text-foreground leading-relaxed">
              {recommendation.brief_reasoning}
            </p>
          </div>

          {/* IMDb Button */}
          {recommendation.imdb_url && (
            <Button 
              variant="default" 
              className="w-full sm:w-auto"
              onClick={() => window.open(recommendation.imdb_url, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on IMDb
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 
 