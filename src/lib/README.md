# Lib Utilities

This directory contains the core utility modules for the Elemental Recs application.

## Files Overview

### `types.ts`
Contains all TypeScript interfaces and type definitions used across the application:
- `RecommendationInput` - API request structure
- `Recommendation` - Core recommendation data structure  
- `TMDBSearchResult` - TMDB API response structure
- `TMDBExternalIds` - TMDB external ID response structure
- `SearchMatch` - Internal search scoring structure

### `ai.ts` 
Handles all AI-related operations:
- `getAIRecommendations()` - Calls Gemini AI and parses responses
- Integrates with prompt generation utilities

### `prompts.ts`
Manages AI prompt generation:
- `generateRecommendationPrompt()` - Creates structured prompts for the AI
- Contains all prompt engineering logic

### `tmdb.ts`
Handles all TMDB (The Movie Database) operations:
- `searchTMDBEnhanced()` - Advanced search with multiple strategies and scoring
- `getIMDBId()` - Retrieves IMDb IDs from TMDB data
- Internal scoring and matching algorithms

## Architecture Benefits

- **Separation of Concerns**: Each module has a single responsibility
- **Testability**: Utilities can be unit tested independently  
- **Maintainability**: Changes to one service don't affect others
- **Reusability**: Utilities can be imported where needed
- **Type Safety**: Centralized type definitions ensure consistency 
