import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createServerClient } from '@/lib/supabase/server';
import { STORAGE_DIR } from '@/lib/paths';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();

  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  if (job.status !== 'completed' || !job.output_path) {
    return NextResponse.json(
      { error: 'Video not ready for download' },
      { status: 400 }
    );
  }

  const filePath = path.join(STORAGE_DIR, job.output_path);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: 'Video file no longer available. Please regenerate.' },
      { status: 404 }
    );
  }

  const stat = fs.statSync(filePath);
  const buffer = fs.readFileSync(filePath);
  const fileName = `${job.track_name} - ${job.artist_name}.mp4`
    .replace(/[<>:"/\\|?*]/g, '_');

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': String(stat.size),
    },
  });
}
