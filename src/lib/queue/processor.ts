import { createServerClient } from '../supabase/server';
import { fetchSyncedLyrics } from '../lrclib';
import { searchPexelsVideo } from '../pexels';
import { downloadPexelsVideo } from '../ffmpeg/download';
import { renderLyricVideo, activeProcesses } from '../ffmpeg/renderer';
import { parseLRC } from '../lrc-parser';
import { FONT_PRESETS } from '../fonts';
import { Job, JobStatus, Settings } from '@/types';

let isProcessing = false;

async function updateJobStatus(
  jobId: string,
  status: JobStatus,
  extra?: Record<string, unknown>
) {
  const supabase = createServerClient();
  const update: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
    ...extra,
  };
  if (status === 'completed') {
    update.completed_at = new Date().toISOString();
  }
  await supabase.from('jobs').update(update).eq('id', jobId);
}

async function getSettings(): Promise<Settings> {
  const supabase = createServerClient();
  const { data } = await supabase.from('settings').select('*').eq('id', 1).single();
  return (
    data || {
      id: 1,
      sync_offset_ms: 0,
      default_vibe: 'nature',
      default_font_preset: 'montserrat',
      updated_at: new Date().toISOString(),
    }
  );
}

async function processJob(job: Job) {
  const settings = await getSettings();

  try {
    // Step 1: Fetch lyrics
    await updateJobStatus(job.id, 'fetching_lyrics');
    const track = await fetchSyncedLyrics(job.track_name, job.artist_name);

    if (!track.syncedLyrics) {
      throw new Error('No synced lyrics available for this song');
    }

    const lyrics = parseLRC(track.syncedLyrics, settings.sync_offset_ms);
    if (lyrics.length === 0) {
      throw new Error('No lyric lines found after parsing');
    }

    await updateJobStatus(job.id, 'fetching_lyrics', {
      lyrics_data: lyrics,
    });

    // Step 2: Find background video
    await updateJobStatus(job.id, 'selecting_background');
    const pexelsResult = await searchPexelsVideo(job.vibe_keyword);
    await updateJobStatus(job.id, 'selecting_background', {
      pexels_video_id: pexelsResult.videoId,
    });

    // Step 3: Download background
    await updateJobStatus(job.id, 'downloading_background');
    const bgPath = await downloadPexelsVideo(
      pexelsResult.downloadUrl,
      pexelsResult.videoId
    );

    // Step 4: Render video
    await updateJobStatus(job.id, 'rendering', { progress: 0 });

    const fontPreset = FONT_PRESETS[job.font_preset] || FONT_PRESETS.montserrat;

    const result = await renderLyricVideo(
      {
        jobId: job.id,
        backgroundPath: bgPath,
        syncedLyrics: track.syncedLyrics,
        fontPreset,
        clipStartS: job.clip_start_s ?? undefined,
        clipEndS: job.clip_end_s ?? undefined,
        syncOffsetMs: settings.sync_offset_ms,
      },
      (percent) => {
        // Fire-and-forget progress update
        updateJobStatus(job.id, 'rendering', { progress: percent });
      }
    );

    // Step 5: Complete
    await updateJobStatus(job.id, 'completed', {
      output_path: result.outputPath,
      duration_s: result.durationS,
      progress: 100,
    });

    // Step 6: Log to history
    const supabase = createServerClient();
    await supabase.from('song_history').insert({
      job_id: job.id,
      track_name: job.track_name,
      artist_name: job.artist_name,
      album_name: track.albumName || null,
      duration_s: result.durationS,
      vibe_keyword: job.vibe_keyword,
      font_preset: job.font_preset,
      output_path: result.outputPath,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    await updateJobStatus(job.id, 'failed', { error_message: message });
  }
}

async function processNextJob() {
  const supabase = createServerClient();

  const { data: nextJob } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (!nextJob) {
    isProcessing = false;
    return;
  }

  await processJob(nextJob as Job);

  // Check for more queued jobs
  await processNextJob();
}

export function triggerProcessor() {
  if (isProcessing) return;
  isProcessing = true;
  // Fire and forget — don't await
  processNextJob().finally(() => {
    isProcessing = false;
  });
}

export function cancelJob(jobId: string) {
  const proc = activeProcesses.get(jobId);
  if (proc) {
    proc.kill('SIGTERM');
    activeProcesses.delete(jobId);
  }
}

/**
 * Reset any jobs stuck in non-terminal states back to queued.
 * Call on app startup.
 */
export async function recoverStaleJobs() {
  const supabase = createServerClient();
  const staleStatuses: JobStatus[] = [
    'fetching_lyrics',
    'selecting_background',
    'downloading_background',
    'rendering',
  ];

  await supabase
    .from('jobs')
    .update({
      status: 'queued',
      progress: 0,
      updated_at: new Date().toISOString(),
    })
    .in('status', staleStatuses);
}
