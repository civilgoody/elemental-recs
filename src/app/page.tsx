'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Film, Tv, Waves, Wind, Flame, Mountain } from 'lucide-react';

interface Recommendation {
  title: string;
  year: number;
  type: 'Movie' | 'TV Show';
  brief_reasoning: string;
  imdb_id?: string;
  imdb_url?: string;
}

export default function Home() {
  const [title1, setTitle1] = useState('');
  const [title2, setTitle2] = useState('');
  const [title3, setTitle3] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title1.trim() || !title2.trim() || !title3.trim()) {
      setError('Please fill in all three fields');
      return;
    }

    setIsLoading(true);
    setError('');
    setRecommendations([]);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title1: title1.trim(),
          title2: title2.trim(),
          title3: title3.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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
          <p className="text-sm text-muted-foreground">
            Tell us three movies or shows you love, and we&apos;ll bend the elements to find your next binge
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-8 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Waves className="w-6 h-6 text-primary" />
              What do you love to watch?
            </CardTitle>
            <CardDescription>
              Enter three movies or TV shows you enjoyed to get personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label htmlFor="title1" className="text-sm font-medium text-foreground mb-2 block">
                    First Favorite
                  </label>
                  <Input
                    id="title1"
                    placeholder="e.g., Avatar: The Last Airbender"
                    value={title1}
                    onChange={(e) => setTitle1(e.target.value)}
                    className="border-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="title2" className="text-sm font-medium text-foreground mb-2 block">
                    Second Favorite
                  </label>
                  <Input
                    id="title2"
                    placeholder="e.g., Studio Ghibli films"
                    value={title2}
                    onChange={(e) => setTitle2(e.target.value)}
                    className="border-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="title3" className="text-sm font-medium text-foreground mb-2 block">
                    Third Favorite
                  </label>
                  <Input
                    id="title3"
                    placeholder="e.g., The Lord of the Rings"
                    value={title3}
                    onChange={(e) => setTitle3(e.target.value)}
                    className="border-primary/30 focus:border-primary"
                  />
                </div>
              </div>
              
              {error && (
                <div className="text-red-600 text-sm mt-2">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? (
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
            </form>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Wind className="w-6 h-6 text-primary" />
              Your Elemental Recommendations
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((rec, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getElementIcon(index)}
                        <CardTitle className="text-lg leading-tight">{rec.title}</CardTitle>
                      </div>
                      <Badge variant="secondary" className={getElementColor(index)}>
                        {rec.type === 'Movie' ? <Film className="w-3 h-3 mr-1" /> : <Tv className="w-3 h-3 mr-1" />}
                        {rec.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{rec.year}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-foreground leading-relaxed">
                      {rec.brief_reasoning}
                    </p>
                    
                    {rec.imdb_url && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => window.open(rec.imdb_url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on IMDb
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>Powered by Gemini AI & The Movie Database</p>
          <p className="mt-1">May the elements guide your next watch 🌊🔥🌪️🗻</p>
        </footer>
      </div>
    </main>
  );
}
