import { NextRequest, NextResponse } from 'next/server';
import { incrementViews, getViewStats } from '@/lib/view-counter';

// GET /api/views - Get current view stats
export async function GET() {
  try {
    const stats = await getViewStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting view stats:', error);
    return NextResponse.json(
      { error: 'Failed to get view stats' },
      { status: 500 }
    );
  }
}

// POST /api/views - Increment view counter
export async function POST(request: NextRequest) {
  try {
    const result = await incrementViews(request);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error incrementing views:', error);
    return NextResponse.json(
      { error: 'Failed to increment views' },
      { status: 500 }
    );
  }
} 
