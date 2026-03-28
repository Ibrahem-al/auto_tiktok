import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  let query = supabase
    .from('song_history')
    .select('*')
    .order('generated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (q) {
    // Use ilike for simple search (full-text search via RPC would be better
    // but this works well enough for a single-user app)
    query = query.or(
      `track_name.ilike.%${q}%,artist_name.ilike.%${q}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
