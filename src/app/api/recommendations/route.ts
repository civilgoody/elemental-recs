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
  country?: string;
  original_language?: string;
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
  original_language?: string;
  origin_country?: string[];
  vote_average?: number;
  popularity?: number;
}

interface TMDBExternalIds {
  imdb_id?: string;
}

interface SearchMatch {
  result: TMDBSearchResult;
  score: number;
  matchReason: string;
}

function scoreMatch(result: TMDBSearchResult, targetTitle: string, targetYear: number, targetType: 'Movie' | 'TV Show', country?: string, originalLanguage?: string): number {
  let score = 0;
  
  // Title similarity (basic)
  const resultTitle = (result.title || result.name || '').toLowerCase();
  const targetTitleLower = targetTitle.toLowerCase();
  if (resultTitle === targetTitleLower) score += 50;
  else if (resultTitle.includes(targetTitleLower) || targetTitleLower.includes(resultTitle)) score += 30;
  
  // Year match (very important)
  const resultYear = result.release_date 
    ? new Date(result.release_date).getFullYear()
    : result.first_air_date
    ? new Date(result.first_air_date).getFullYear()
    : null;
  
  if (resultYear) {
    const yearDiff = Math.abs(resultYear - targetYear);
    if (yearDiff === 0) score += 40;
    else if (yearDiff === 1) score += 30;
    else if (yearDiff <= 2) score += 15;
    else if (yearDiff <= 5) score += 5;
  }
  
  // Media type match
  const isMovie = result.media_type === 'movie' || (result.title && !result.name);
  const isTv = result.media_type === 'tv' || (result.name && !result.title);
  
  if ((targetType === 'Movie' && isMovie) || (targetType === 'TV Show' && isTv)) {
    score += 25;
  }
  
  // Country match (if specified)
  if (country && result.origin_country?.includes(country)) {
    score += 20;
  }
  
  // Language match (if specified)
  if (originalLanguage && result.original_language === originalLanguage) {
    score += 15;
  }
  
  // Popularity/rating boost (prefer well-known titles)
  if (result.vote_average && result.vote_average > 7) score += 10;
  if (result.popularity && result.popularity > 20) score += 5;
  
  return score;
}

async function searchTMDBEnhanced(title: string, year: number, type: 'Movie' | 'TV Show', country?: string, originalLanguage?: string): Promise<TMDBSearchResult | null> {
  const tmdbApiKey = process.env.TMDB_API_KEY;
  if (!tmdbApiKey) {
    console.error('TMDB API key not found');
    return null;
  }

  try {
    const query = encodeURIComponent(title);
    const matches: SearchMatch[] = [];
    
    // Strategy 1: Multi search
    const multiUrl = `https://api.themoviedb.org/3/search/multi?api_key=${tmdbApiKey}&query=${query}`;
    const multiResponse = await fetch(multiUrl);
    const multiData = await multiResponse.json();
    
    if (multiData.results) {
      multiData.results.forEach((result: TMDBSearchResult) => {
        const score = scoreMatch(result, title, year, type, country, originalLanguage);
        if (score > 20) { // Only consider reasonable matches
          matches.push({ result, score, matchReason: 'multi-search' });
        }
      });
    }
    // Strategy 2: Specific movie/TV search
    const specificEndpoint = type === 'Movie' ? 'movie' : 'tv';
    const specificUrl = `https://api.themoviedb.org/3/search/${specificEndpoint}?api_key=${tmdbApiKey}&query=${query}&year=${year}`;
    const specificResponse = await fetch(specificUrl);
    const specificData = await specificResponse.json();
    
    if (specificData.results) {
      specificData.results.forEach((result: TMDBSearchResult) => {
        // Add media_type since specific searches don't include it
        result.media_type = specificEndpoint;
        const score = scoreMatch(result, title, year, type, country, originalLanguage);
        if (score > 20) {
          matches.push({ result, score, matchReason: 'specific-search' });
        }
      });
    }
    // Strategy 3: If we have country/language info, try discovery
    if (country || originalLanguage) {
      let discoverUrl = `https://api.themoviedb.org/3/discover/${specificEndpoint}?api_key=${tmdbApiKey}&primary_release_year=${year}`;
      if (originalLanguage) discoverUrl += `&with_original_language=${originalLanguage}`;
      if (country) discoverUrl += `&with_origin_country=${country}`;
      
      const discoverResponse = await fetch(discoverUrl);
      const discoverData = await discoverResponse.json();
      
      if (discoverData.results) {
        discoverData.results.forEach((result: TMDBSearchResult) => {
          result.media_type = specificEndpoint;
          const score = scoreMatch(result, title, year, type, country, originalLanguage);
          if (score > 15) { // Lower threshold for discovery results
            matches.push({ result, score, matchReason: 'discover' });
          }
        });
      }
    }
    // Remove duplicates and sort by score
    const uniqueMatches = matches.reduce((acc, match) => {
      const existing = acc.find(m => m.result.id === match.result.id);
      if (!existing || existing.score < match.score) {
        acc = acc.filter(m => m.result.id !== match.result.id);
        acc.push(match);
      }
      return acc;
    }, [] as SearchMatch[]);
    
    uniqueMatches.sort((a, b) => b.score - a.score);
    
    if (uniqueMatches.length > 0) {
      const bestMatch = uniqueMatches[0];
      console.log(`Best match for "${title}" (${year}): ${bestMatch.result.title || bestMatch.result.name} - Score: ${bestMatch.score} - Reason: ${bestMatch.matchReason}`);
      return bestMatch.result;
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

Please format your entire response as a single JSON object with a key 'recommendations' which is an array of objects, where each object contains 'title', 'year', 'type', 'brief_reasoning', and optionally 'country' and 'original_language' for better identification.

Example format:
{
  "recommendations": [
    {
      "title": "The Matrix",
      "year": 1999,
      "type": "Movie",
      "brief_reasoning": "Like your favorites, this combines philosophical themes with innovative visual storytelling and explores questions about reality and human nature.",
      "country": "US",
      "original_language": "en"
    }
  ]
}

Important guidelines:
- Be as specific as possible with titles (include original titles if different from English)
- For anime, specify if it's the anime version vs live-action
- Include country of origin (US, JP, KR, etc.) when relevant for identification
- Include original language (en, ja, ko, etc.) when helpful
- Focus on providing diverse and high-quality recommendations that go beyond obvious surface-level similarities
- Prioritize titles that are well-regarded or critically acclaimed if they fit the user's taste profile
- Do not recommend the input titles themselves
- Ensure the year is accurate and the type is either "Movie" or "TV Show"`;

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

    // Enhance recommendations with IMDB links using improved search
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
