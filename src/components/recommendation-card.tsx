import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Film, Tv, Waves, Wind, Flame, Mountain } from 'lucide-react';
import { Recommendation } from '@/lib/types';

interface RecommendationCardProps {
  recommendation: Recommendation;
  index: number;
}

export function RecommendationCard({ recommendation, index }: RecommendationCardProps) {
  const getElementIcon = (index: number) => {
    const icons = [Waves, Wind, Flame, Mountain, Waves];
    const Icon = icons[index % icons.length];
    return <Icon className="w-5 h-5" />;
  };

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

  // Prefer backdrop for landscape images, fallback to poster
  const imageUrl = recommendation.backdrop_path 
    ? `https://image.tmdb.org/t/p/w780${recommendation.backdrop_path}`
    : recommendation.poster_path 
    ? `https://image.tmdb.org/t/p/w342${recommendation.poster_path}`
    : null;

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary overflow-hidden">
      {/* Image Section */}
      {imageUrl ? (
        <div className="relative w-full h-48 bg-muted overflow-hidden">
          <Image
            src={imageUrl}
            alt={`${recommendation.title} poster`}
            fill
            className="object-cover"
            loading="lazy"
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Badge overlay */}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className={getElementColor(index)}>
              {recommendation.type === 'Movie' ? <Film className="w-3 h-3 mr-1" /> : <Tv className="w-3 h-3 mr-1" />}
              {recommendation.type}
            </Badge>
          </div>
        </div>
      ) : (
        /* Fallback placeholder when no image */
        <div className="relative w-full h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-3">
              {recommendation.type === 'Movie' ? (
                <Film className="w-12 h-12 text-primary mx-auto" />
              ) : (
                <Tv className="w-12 h-12 text-primary mx-auto" />
              )}
            </div>
            <div className="text-lg font-semibold text-primary mb-1">{recommendation.title}</div>
            <div className="text-sm text-muted-foreground">{recommendation.year}</div>
          </div>
          
          {/* Badge for fallback */}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className={getElementColor(index)}>
              {recommendation.type === 'Movie' ? <Film className="w-3 h-3 mr-1" /> : <Tv className="w-3 h-3 mr-1" />}
              {recommendation.type}
            </Badge>
          </div>
        </div>
      )}

      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {getElementIcon(index)}
            <CardTitle className="text-lg leading-tight line-clamp-2">{recommendation.title}</CardTitle>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{recommendation.year}</span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 space-y-4">
        {/* Reasoning - fixed height with line clamping */}
        <div className="flex-1">
          <p className="text-sm text-foreground leading-relaxed line-clamp-4">
            {recommendation.brief_reasoning}
          </p>
        </div>
        
        {/* IMDb Button - always at bottom */}
        {recommendation.imdb_url && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-auto"
            onClick={() => window.open(recommendation.imdb_url, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on IMDb
          </Button>
        )}
      </CardContent>
    </Card>
  );
} 
