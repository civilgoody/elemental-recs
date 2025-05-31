'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Waves } from 'lucide-react';
import { MovieSearchInput } from '@/components/movie-search-input';
import { ViewCounter } from '@/components/view-counter';
import { StreamingRecommendations } from '@/components/streaming-recommendations';
import { RecommendationSheet } from '@/components/recommendation-sheet';
import { useStreamingRecommendations } from '@/hooks/use-streaming-recommendations';

import { TMDBSearchResult, Recommendation } from '@/lib/types';

export default function Home() {
  const [selection1, setSelection1] = useState<TMDBSearchResult | null>(null);
  const [selection2, setSelection2] = useState<TMDBSearchResult | null>(null);
  const [selection3, setSelection3] = useState<TMDBSearchResult | null>(null);
  const [error, setError] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedRecommendationIndex, setSelectedRecommendationIndex] = useState(0);

  const { streamingState, isInitializing, isStreaming, startStreaming } = useStreamingRecommendations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selection1 || !selection2 || !selection3) {
      setError('Please select all three movies or TV shows');
      return;
    }

    setError('');

    // Start streaming recommendations
    await startStreaming({
      title1: selection1.title || selection1.name || '',
      title2: selection2.title || selection2.name || '',
      title3: selection3.title || selection3.name || '',
      // Include TMDB context for better matching
      context1: {
        year: selection1.display_year,
        country: selection1.origin_country?.[0],
        language: selection1.original_language,
      },
      context2: {
        year: selection2.display_year,
        country: selection2.origin_country?.[0],
        language: selection2.original_language,
      },
      context3: {
        year: selection3.display_year,
        country: selection3.origin_country?.[0],
        language: selection3.original_language,
      },
    });
  };

  const handleRecommendationClick = (index: number) => {
    setSelectedRecommendationIndex(index);
    setIsSheetOpen(true);
  };

  // Convert streaming recommendations to legacy format for RecommendationSheet
  const legacyRecommendations: Recommendation[] = streamingState.recommendations
    .filter((rec): rec is NonNullable<typeof rec> => rec !== null)
    .map(rec => ({
      title: rec.title,
      year: rec.year,
      type: rec.type,
      brief_reasoning: rec.brief_reasoning,
      country: rec.country,
      original_language: rec.original_language,
      imdb_id: rec.imdb_id,
      imdb_url: rec.imdb_url,
      poster_path: rec.poster_path,
      backdrop_path: rec.backdrop_path,
      tmdb_id: rec.tmdb_id,
      vote_average: rec.vote_average,
      vote_count: rec.vote_count,
    }));

  const hasRecommendations = streamingState.recommendations.some(rec => rec !== null);
  const hasStartedStreaming = isInitializing || isStreaming || streamingState.isComplete;
  const showStreamingUI = hasRecommendations || hasStartedStreaming || streamingState.reasoning;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4 animate-air-float">
            🌊 Elemental Recs 🔥
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Your AI Bending Movie & TV Show Recommender
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Search and select three verified movies or shows, and we&apos;ll bend the elements to find your next binge
          </p>
          <ViewCounter />
        </div>

        {/* Input Form */}
        <Card className="mb-8 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Waves className="w-6 h-6 text-primary" />
              What do you love to watch?
            </CardTitle>
            <CardDescription>
              Search and select three verified movies or TV shows to get personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <MovieSearchInput
                  label="First Favorite"
                  placeholder="Search for a movie or TV show..."
                  value={selection1}
                  onChange={setSelection1}
                  disabled={isInitializing}
                  />
                <MovieSearchInput
                  label="Second Favorite"
                  placeholder="Search for another one..."
                  value={selection2}
                  onChange={setSelection2}
                  disabled={isInitializing}
                  />
                <MovieSearchInput
                  label="Third Favorite"
                  placeholder="And one more..."
                  value={selection3}
                  onChange={setSelection3}
                  disabled={isInitializing}
                />
              </div>
              
              {error && (
                <div className="text-red-600 text-sm mt-2">
                  {error}
                </div>
              )}

              {streamingState.error && (
                <div className="text-red-600 text-sm mt-2">
                  {streamingState.error}
                </div>
              )}

              <div className="space-y-2">
              <Button 
                type="submit" 
                  disabled={isInitializing || !selection1 || !selection2 || !selection3}
                  className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
              >
                {isInitializing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Bending the Elements...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Waves className="w-4 h-4" />
                    Find My Next Binge
                  </div>
                )}
              </Button>
                
                {(!selection1 || !selection2 || !selection3) && !isInitializing && (
                  <p className="text-sm text-muted-foreground">
                    💡 Search and select verified movies or TV shows from the database
                  </p>
                )}
                
                {isStreaming && (
                  <p className="text-sm text-primary">
                    ✨ Streaming your recommendations in real-time...
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Streaming Recommendations */}
        {showStreamingUI && (
          <StreamingRecommendations 
            streamingState={streamingState}
            onRecommendationClick={handleRecommendationClick}
            isInitializing={isInitializing}
          />
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>Powered by Gemini AI & The Movie Database</p>
          <p className="mt-1">May the elements guide your next watch 🌊🔥🌪️🗻</p>
        </footer>

        {/* Recommendation Sheet Modal */}
        <RecommendationSheet
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          recommendations={legacyRecommendations}
          initialIndex={selectedRecommendationIndex}
        />
      </div>
    </main>
  );
}
