import { NextRequest, NextResponse } from 'next/server';
import { searchTMDBForAutocomplete } from '@/lib/tmdb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const results = await searchTMDBForAutocomplete(query);
    return NextResponse.json({ results });

  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
} 
