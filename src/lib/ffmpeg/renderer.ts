import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { TimedLyric, FontPreset } from '@/types';
import { parseLRC, filterByClipRange, getTotalDuration } from '../lrc-parser';
import { generateASS } from './ass-generator';
import { OUTPUT_DIR, FONTS_DIR } from '../paths';
import { getFFmpegPath } from './ffmpeg-path';
import {
  VIDEO_FPS,
  VIDEO_CRF,
  VIDEO_PRESET,
  VIDEO_WIDTH,
  VIDEO_HEIGHT,
} from '../constants';

export interface RenderOptions {
  jobId: string;
  backgroundPath: string;
  syncedLyrics: string;
  fontPreset: FontPreset;
  clipStartS?: number;
  clipEndS?: number;
  syncOffsetMs: number;
}

export interface RenderResult {
  outputPath: string;
  durationS: number;
}

// Track active FFmpeg processes for cancellation
export const activeProcesses = new Map<string, ChildProcess>();

export async function renderLyricVideo(
  options: RenderOptions,
  onProgress?: (percent: number) => void
): Promise<RenderResult> {
  const {
    jobId,
    backgroundPath,
    syncedLyrics,
    fontPreset,
    clipStartS,
    clipEndS,
    syncOffsetMs,
  } = options;

  // 1. Parse lyrics
  let lyrics = parseLRC(syncedLyrics, syncOffsetMs);
  if (lyrics.length === 0) {
    throw new Error('No lyric lines found after parsing');
  }

  // 2. Apply clip range if specified
  if (clipStartS != null && clipEndS != null) {
    lyrics = filterByClipRange(lyrics, clipStartS, clipEndS);
    if (lyrics.length === 0) {
      throw new Error(
        `No lyrics found in the specified time range (${clipStartS}s - ${clipEndS}s)`
      );
    }
  }

  // 3. Calculate duration (add 2s padding after last lyric)
  const durationS = getTotalDuration(lyrics) + 2;

  // 4. Generate ASS subtitle file
  const assContent = generateASS(lyrics, fontPreset);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lyricvision-'));
  const assPath = path.join(tempDir, 'lyrics.ass');
  fs.writeFileSync(assPath, assContent, 'utf-8');

  // 5. Prepare output path
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outputPath = path.join(OUTPUT_DIR, `${jobId}.mp4`);

  try {
    await runFFmpeg({
      jobId,
      backgroundPath,
      assPath,
      outputPath,
      durationS,
      clipStartS,
      onProgress,
    });

    return {
      outputPath: `output/${jobId}.mp4`,
      durationS,
    };
  } finally {
    // Cleanup temp files
    fs.rmSync(tempDir, { recursive: true, force: true });
    activeProcesses.delete(jobId);
  }
}

interface FFmpegRunOptions {
  jobId: string;
  backgroundPath: string;
  assPath: string;
  outputPath: string;
  durationS: number;
  clipStartS?: number;
  onProgress?: (percent: number) => void;
}

function runFFmpeg(options: FFmpegRunOptions): Promise<void> {
  const {
    jobId,
    backgroundPath,
    assPath,
    outputPath,
    durationS,
    clipStartS,
    onProgress,
  } = options;

  return new Promise((resolve, reject) => {
    // Build filter string with Windows-safe paths
    const assPathForFilter = assPath.replace(/\\/g, '/').replace(/:/g, '\\:');
    const fontsDirForFilter = FONTS_DIR.replace(/\\/g, '/').replace(/:/g, '\\:');

    const vf = [
      `scale=${VIDEO_WIDTH}:${VIDEO_HEIGHT}:force_original_aspect_ratio=increase`,
      `crop=${VIDEO_WIDTH}:${VIDEO_HEIGHT}`,
      'setsar=1',
      `ass='${assPathForFilter}':fontsdir='${fontsDirForFilter}'`,
    ].join(',');

    const args: string[] = [];

    // Input with looping
    args.push('-stream_loop', '-1');

    // Seek if clip range
    if (clipStartS != null && clipStartS > 0) {
      args.push('-ss', String(clipStartS));
    }

    args.push('-i', backgroundPath);

    // Output duration
    args.push('-t', String(durationS));

    // Video filters
    args.push('-vf', vf);

    // Output settings
    args.push(
      '-r', String(VIDEO_FPS),
      '-c:v', 'libx264',
      '-preset', VIDEO_PRESET,
      '-crf', String(VIDEO_CRF),
      '-pix_fmt', 'yuv420p',
      '-an',
      '-movflags', '+faststart',
      '-y',
      outputPath
    );

    const ffmpegBin = getFFmpegPath();
    const proc = spawn(ffmpegBin, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    activeProcesses.set(jobId, proc);

    let stderrBuffer = '';

    proc.stderr?.on('data', (chunk: Buffer) => {
      stderrBuffer += chunk.toString();

      // Parse progress
      const timeMatch = stderrBuffer.match(/time=(\d{2}):(\d{2}):(\d{2})\.(\d{2})/);
      if (timeMatch && onProgress) {
        const [, hh, mm, ss, cs] = timeMatch;
        const timeSec =
          parseInt(hh) * 3600 +
          parseInt(mm) * 60 +
          parseInt(ss) +
          parseInt(cs) / 100;
        const percent = Math.min(100, Math.round((timeSec / durationS) * 100));
        onProgress(percent);
      }

      // Keep buffer manageable
      if (stderrBuffer.length > 2000) {
        stderrBuffer = stderrBuffer.slice(-1000);
      }
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        // Extract meaningful error from stderr
        const errorLines = stderrBuffer
          .split('\n')
          .filter((l) => l.includes('Error') || l.includes('error') || l.includes('Invalid'))
          .slice(-3)
          .join('\n');
        reject(
          new Error(
            `FFmpeg exited with code ${code}. ${errorLines || stderrBuffer.slice(-500)}`
          )
        );
      }
    });

    proc.on('error', (err) => {
      if ('code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
        reject(
          new Error(
            'FFmpeg not found. Please install FFmpeg and ensure it is in your system PATH.'
          )
        );
      } else {
        reject(new Error(`Failed to spawn FFmpeg: ${err.message}`));
      }
    });
  });
}
