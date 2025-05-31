import { searchTMDBEnhanced, getIMDBId } from '@/lib/tmdb';

export async function POST(request: Request) {
  try {
    const { recommendations } = await request.json();

    if (!recommendations || !Array.isArray(recommendations)) {
      return new Response('Invalid recommendations data', { status: 400 });
    }

    const enhancedRecommendations = [];

    for (const rec of recommendations) {
      if (!rec || !rec.title) {
        enhancedRecommendations.push(rec);
        continue;
      }

      try {
        const tmdbResult = await searchTMDBEnhanced(
          rec.title,
          rec.year,
          rec.type,
          rec.country,
          rec.original_language
        );

        if (tmdbResult) {
          let imdbId = null;
          let imdbUrl = null;

          // Get IMDB ID if we have TMDB data
          if (tmdbResult.id && tmdbResult.media_type) {
            imdbId = await getIMDBId(tmdbResult.id, tmdbResult.media_type);
            if (imdbId) {
              imdbUrl = `https://www.imdb.com/title/${imdbId}/`;
            }
          }

          enhancedRecommendations.push({
            ...rec,
            tmdb_id: tmdbResult.id,
            poster_path: tmdbResult.poster_path,
            backdrop_path: tmdbResult.backdrop_path,
            vote_average: tmdbResult.vote_average,
            vote_count: tmdbResult.vote_count,
            imdb_id: imdbId || undefined,
            imdb_url: imdbUrl || undefined,
            enhanced: true,
          });
        } else {
          // Mark as enhanced even if no TMDB data found
          enhancedRecommendations.push({
            ...rec,
            enhanced: true,
          });
        }

        // Small delay between enhancements to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error enhancing recommendation:`, error);
        
        // Mark as enhanced to remove loading indicator
        enhancedRecommendations.push({
          ...rec,
          enhanced: true,
        });
      }
    }

    return new Response(JSON.stringify({ recommendations: enhancedRecommendations }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Enhancement API Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 
