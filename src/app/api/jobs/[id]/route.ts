import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cancelJob } from '@/lib/queue/processor';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();

  // Cancel FFmpeg process if running
  cancelJob(id);

  const { error } = await supabase
    .from('jobs')
    .update({
      status: 'failed',
      error_message: 'Cancelled by user',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .in('status', [
      'queued',
      'fetching_lyrics',
      'selecting_background',
      'downloading_background',
      'rendering',
    ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
