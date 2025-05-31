import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wind } from 'lucide-react';
import { RecommendationCard } from './recommendation-card';
import { RecommendationSkeleton } from './recommendation-skeleton';
import { StreamingState, StreamingRecommendation } from '@/lib/types';

interface StreamingRecommendationsProps {
  streamingState: StreamingState;
  onRecommendationClick?: (index: number) => void;
}

export function StreamingRecommendations({ streamingState, onRecommendationClick }: StreamingRecommendationsProps) {
  const { recommendations, isComplete, error } = streamingState;
  
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardContent className="pt-6">
          <p className="text-red-600 dark:text-red-400">
            Error: {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recommendations Grid */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Wind className="w-6 h-6 text-primary" />
          Your Elemental Recommendations
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }, (_, index) => {
            const recommendation = recommendations[index] as StreamingRecommendation | null;
            
            if (recommendation) {
              // Handle thinking state or streaming text
              if (recommendation.isThinking || recommendation.streamingText !== undefined) {
                return (
                  <Card key={index} className="relative border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        {recommendation.title === 'Thinking...' ? 'AI is thinking...' : recommendation.title}
                      </CardTitle>
                      {recommendation.year > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {recommendation.year} • {recommendation.type}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      {recommendation.streamingText !== undefined ? (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-primary">Why this matches:</h4>
                          <p className="text-sm text-foreground leading-relaxed">
                            {recommendation.streamingText}
                            <span className="animate-pulse">|</span>
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded animate-pulse" />
                          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                          <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              }
              
              // Convert StreamingRecommendation to Recommendation for the card
              const fullRecommendation = {
                title: recommendation.title,
                year: recommendation.year,
                type: recommendation.type,
                brief_reasoning: recommendation.brief_reasoning || '',
                country: recommendation.country,
                original_language: recommendation.original_language,
                imdb_id: recommendation.imdb_id,
                imdb_url: recommendation.imdb_url,
                poster_path: recommendation.poster_path,
                backdrop_path: recommendation.backdrop_path,
                tmdb_id: recommendation.tmdb_id,
                vote_average: recommendation.vote_average,
                vote_count: recommendation.vote_count,
              };

              return (
                <div key={index} className="relative">
                  <RecommendationCard 
                    recommendation={fullRecommendation}
                    index={index} 
                    onClick={() => onRecommendationClick?.(index)}
                  />
                  {/* Enhancement loading indicator */}
                  {!recommendation.enhanced && (
                    <div className="absolute top-2 left-2 z-10">
                      <div className="bg-primary/20 backdrop-blur-sm rounded-full p-2">
                        <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            
            return <RecommendationSkeleton key={index} index={index} />;
          })}
        </div>
      </div>

      {/* Loading indicator for incomplete state */}
      {!isComplete && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            Generating personalized recommendations...
          </div>
        </div>
      )}
    </div>
  );
} 
