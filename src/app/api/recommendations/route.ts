import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

interface RecommendationInput {
  title1: string;
  title2: string;
  title3: string;
}

interface Recommendation {
  title: string;
  year: number;
  type: 'Movie' | 'TV Show';
  brief_reasoning: string;
  imdb_id?: string;
  imdb_url?: string;
}

interface TMDBSearchResult {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
}

interface TMDBExternalIds {
  imdb_id?: string;
}

async function searchTMDB(title: string, year?: number): Promise<TMDBSearchResult | null> {
  const tmdbApiKey = process.env.TMDB_API_KEY;
  if (!tmdbApiKey) {
    console.error('TMDB API key not found');
    return null;
  }

  try {
    const query = encodeURIComponent(title);
    const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${tmdbApiKey}&query=${query}`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      // Try to find the best match considering year if provided
      let bestMatch = data.results[0];
      
      if (year) {
        const yearMatch = data.results.find((result: TMDBSearchResult) => {
          const resultYear = result.release_date 
            ? new Date(result.release_date).getFullYear()
            : result.first_air_date
            ? new Date(result.first_air_date).getFullYear()
            : null;
          
          return resultYear && Math.abs(resultYear - year) <= 1;
        });
        
        if (yearMatch) bestMatch = yearMatch;
      }
      
      return bestMatch;
    }
    
    return null;
  } catch (error) {
    console.error('Error searching TMDB:', error);
    return null;
  }
}

async function getIMDBId(tmdbId: number, mediaType: string): Promise<string | null> {
  const tmdbApiKey = process.env.TMDB_API_KEY;
  if (!tmdbApiKey) return null;

  try {
    const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
    const url = `https://api.themoviedb.org/3/${endpoint}/${tmdbId}/external_ids?api_key=${tmdbApiKey}`;
    
    const response = await fetch(url);
    const data: TMDBExternalIds = await response.json();
    
    return data.imdb_id || null;
  } catch (error) {
    console.error('Error getting IMDB ID:', error);
    return null;
  }
}

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

    const prompt = `You are an expert movie and TV show recommendation assistant.
A user has provided three titles they enjoyed:
1. "${title1}"
2. "${title2}"
3. "${title3}"

Your task is to:
A. Thoroughly analyze what is common across these three titles. Consider elements such as genre, subgenre, themes, narrative style, character archetypes, directors, actors, tone, pacing, and potential underlying reasons why a person might enjoy all three.
B. Based on this analysis, recommend exactly 5 new movies or TV shows that the user would likely enjoy.
C. For each recommendation, provide the following information in JSON format:

Please format your entire response as a single JSON object with a key 'recommendations' which is an array of objects, where each object contains 'title', 'year', 'type', and 'brief_reasoning'.

Example format:
{
  "recommendations": [
    {
      "title": "The Matrix",
      "year": 1999,
      "type": "Movie",
      "brief_reasoning": "Like your favorites, this combines philosophical themes with innovative visual storytelling and explores questions about reality and human nature."
    }
  ]
}

Focus on providing diverse and high-quality recommendations that go beyond obvious surface-level similarities. Prioritize titles that are well-regarded or critically acclaimed if they fit the user's taste profile. Do not recommend the input titles themselves. Ensure the year is accurate and the type is either "Movie" or "TV Show".`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response to extract JSON
    text = text.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
    
    let recommendations: Recommendation[];
    try {
      const parsed = JSON.parse(text);
      recommendations = parsed.recommendations || [];
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    // Enhance recommendations with IMDB links
    const enhancedRecommendations = await Promise.all(
      recommendations.map(async (rec) => {
        try {
          const tmdbResult = await searchTMDB(rec.title, rec.year);
          if (tmdbResult) {
            const mediaType = tmdbResult.media_type || (rec.type === 'Movie' ? 'movie' : 'tv');
            const imdbId = await getIMDBId(tmdbResult.id, mediaType);
            
            if (imdbId) {
              return {
                ...rec,
                imdb_id: imdbId,
                imdb_url: `https://www.imdb.com/title/${imdbId}/`
              };
            }
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
