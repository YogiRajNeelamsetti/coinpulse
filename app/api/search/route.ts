import { NextRequest, NextResponse } from 'next/server';
import { searchCoins } from '@/lib/coingecko.actions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');

  if (!query || !query.trim()) {
    return NextResponse.json([]);
  }

  try {
    const results = await searchCoins(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    // Return empty array instead of error to prevent UI breaking
    return NextResponse.json([]);
  }
}
