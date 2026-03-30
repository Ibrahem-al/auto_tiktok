import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { triggerProcessor } from '@/lib/queue/processor';
import { REPEAT_WARNING_DAYS } from '@/lib/constants';

const createJobSchema = z.object({
  trackName: z.string().min(1, 'Song name is required'),
  artistName: z.string().min(1, 'Artist name is required'),
  vibeKeyword: z.string().optional().default('nature'),
  fontPreset: z.string().optional().default('montserrat'),
  fontColor: z.string().optional().default('white'),
  textPosition: z.string().optional().default('center'),
  textSize: z.string().optional().default('large'),
  blurAmount: z.number().min(0).max(20).optional().default(3),
  wordsPerLine: z.number().int().min(0).max(20).optional().default(0),
  clipStartS: z.number().min(0).optional(),
  clipEndS: z.number().min(0).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createJobSchema.parse(body);

    if (parsed.clipStartS != null && parsed.clipEndS != null && parsed.clipEndS <= parsed.clipStartS) {
      return NextResponse.json(
        { error: 'Clip end must be after clip start' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check for recent generation (30-day repeat warning)
    let warning: string | undefined;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - REPEAT_WARNING_DAYS);

    const { data: recent } = await supabase
      .from('song_history')
      .select('generated_at')
      .ilike('track_name', parsed.trackName)
      .ilike('artist_name', parsed.artistName)
      .gte('generated_at', cutoff.toISOString())
      .order('generated_at', { ascending: false })
      .limit(1);

    if (recent && recent.length > 0) {
      const daysAgo = Math.floor(
        (Date.now() - new Date(recent[0].generated_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      warning = `This song was generated ${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`;
    }

    // Insert job
    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        track_name: parsed.trackName,
        artist_name: parsed.artistName,
        vibe_keyword: parsed.vibeKeyword,
        font_preset: parsed.fontPreset,
        font_color: parsed.fontColor,
        text_position: parsed.textPosition,
        text_size: parsed.textSize,
        blur_amount: parsed.blurAmount,
        words_per_line: parsed.wordsPerLine,
        clip_start_s: parsed.clipStartS ?? null,
        clip_end_s: parsed.clipEndS ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    // Trigger queue processor (fire and forget)
    triggerProcessor();

    return NextResponse.json({ ...job, warning }, { status: 201 });
  } catch (err) {
    console.error('Job creation error:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0].message },
        { status: 400 }
      );
    }
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
