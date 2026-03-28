import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';

const updateSettingsSchema = z.object({
  sync_offset_ms: z.number().int().min(-2000).max(2000).optional(),
  default_vibe: z.string().optional(),
  default_font_preset: z.string().optional(),
});

export async function GET() {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = updateSettingsSchema.parse(body);

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('settings')
      .update({
        ...parsed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
