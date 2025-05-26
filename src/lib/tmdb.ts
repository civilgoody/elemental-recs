import { TMDBSearchResult, TMDBExternalIds, SearchMatch } from './types';

function scoreMatch(
  result: TMDBSearchResult, 
  targetTitle: string, 
  targetYear: number, 
  targetType: 'Movie' | 'TV Show', 
  country?: string, 
  originalLanguage?: string
): number {
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

export async function searchTMDBEnhanced(
  title: string, 
  year: number, 
  type: 'Movie' | 'TV Show', 
  country?: string, 
  originalLanguage?: string
): Promise<TMDBSearchResult | null> {
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

export async function getIMDBId(tmdbId: number, mediaType: string): Promise<string | null> {
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

export async function searchTMDBForAutocomplete(query: string): Promise<TMDBSearchResult[]> {
  const tmdbApiKey = process.env.TMDB_API_KEY;
  if (!tmdbApiKey || query.length < 2) {
    return [];
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${tmdbApiKey}&query=${encodedQuery}&page=1`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.results) {
      // Filter and limit results for autocomplete
      return data.results
        .filter((result: TMDBSearchResult) => 
          (result.media_type === 'movie' || result.media_type === 'tv') &&
          (result.title || result.name) &&
          result.vote_count && result.vote_count > 10 // Filter out obscure entries
        )
        .slice(0, 8) // Limit to 8 results for UI
        .map((result: TMDBSearchResult) => ({
          ...result,
          display_title: result.title || result.name,
          display_year: result.release_date 
            ? new Date(result.release_date).getFullYear()
            : result.first_air_date
            ? new Date(result.first_air_date).getFullYear()
            : null
        }));
    }
    
    return [];
  } catch (error) {
    console.error('Error searching TMDB for autocomplete:', error);
    return [];
  }
} 
