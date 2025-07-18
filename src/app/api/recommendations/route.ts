import { NextRequest, NextResponse } from 'next/server';
import { RecommendationInput } from '@/lib/types';
import { getAIRecommendations } from '@/lib/ai';
import { searchTMDBEnhanced, getIMDBId } from '@/lib/tmdb';

export async function POST(request: NextRequest) {
  try {
    const body: RecommendationInput = await request.json();
    const { title1, title2, title3 } = body;

    if (!title1 || !title2 || !title3) {
      return NextResponse.json(
        { error: 'All three movie/show titles are required' },
        { status: 400 }
      );
    }

    // Get AI recommendations
    const recommendations = await getAIRecommendations(title1, title2, title3);

    // Enhance recommendations with IMDB links and images using improved search
    const enhancedRecommendations = await Promise.all(
      recommendations.map(async (rec) => {
        try {
          const tmdbResult = await searchTMDBEnhanced(
            rec.title, 
            rec.year, 
            rec.type, 
            rec.country, 
            rec.original_language
          );
          
          if (tmdbResult) {
            const mediaType = tmdbResult.media_type || (rec.type === 'Movie' ? 'movie' : 'tv');
            const imdbId = await getIMDBId(tmdbResult.id, mediaType);
            
              return {
                ...rec,
              imdb_id: imdbId || undefined,
              imdb_url: imdbId ? `https://www.imdb.com/title/${imdbId}/` : undefined,
              poster_path: tmdbResult.poster_path || undefined,
              backdrop_path: tmdbResult.backdrop_path || undefined,
              tmdb_id: tmdbResult.id,
              vote_average: tmdbResult.vote_average || undefined,
              vote_count: tmdbResult.vote_count || undefined,
              };
          }
        } catch (error) {
          console.error(`Error enhancing recommendation for ${rec.title}:`, error);
        }
        
        return rec;
      })
    );

    return NextResponse.json({ recommendations: enhancedRecommendations });

  } catch (error) {
    console.error('Error in recommendations API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
