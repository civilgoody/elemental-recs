export interface Context {
  year?: number;
  country?: string;
  language?: string;
}

export interface RecommendationInput {
  title1: string;
  title2: string;
  title3: string;
  context1?: {
    year?: number;
    country?: string;
    language?: string;
  };
  context2?: {
    year?: number;
    country?: string;
    language?: string;
  };
  context3?: {
    year?: number;
    country?: string;
    language?: string;
  };
}

export interface Recommendation {
  title: string;
  year: number;
  type: 'Movie' | 'TV Show';
  brief_reasoning: string;
  country?: string;
  original_language?: string;
  imdb_id?: string;
  imdb_url?: string;
  poster_path?: string;
  backdrop_path?: string;
  tmdb_id?: number;
  vote_average?: number;
  vote_count?: number;
}

export interface TMDBSearchResult {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
  original_language?: string;
  origin_country?: string[];
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  poster_path?: string;
  backdrop_path?: string;
  display_title?: string;
  display_year?: number;
}

export interface TMDBExternalIds {
  imdb_id?: string;
}

export interface SearchMatch {
  result: TMDBSearchResult;
  score: number;
  matchReason: string;
} 
 