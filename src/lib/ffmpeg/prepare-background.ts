import { spawn } from 'child_process';
import { getFFmpegPath } from './ffmpeg-path';
import { probeVideo } from './ffprobe';
import { RenderProfile } from '../render-profile';

const FADE_S = 1.2;
const MIN_CLIP_S = 5;

interface ClipInfo {
  path: string;
  durationS: number;
}

export async function prepareSeamlessBackground(
  clipPaths: string[],
  outputPath: string,
  targetDurationS: number,
  profile: RenderProfile
): Promise<string> {
  if (clipPaths.length === 0) {
    throw new Error('No background clips provided');
  }

  const clips: ClipInfo[] = [];
  for (const p of clipPaths) {
    try {
      const info = await probeVideo(p);
      if (info.durationSec >= MIN_CLIP_S) {
        clips.push({ path: p, durationS: info.durationSec });
      }
    } catch {
      // Skip unreadable clips
    }
  }

  if (clips.length === 0) {
    throw new Error('No usable background clips found');
  }

  const playlist = buildPlaylist(clips, targetDurationS + 5);
  await renderBackground(playlist, outputPath, profile);
  return outputPath;
}

function buildPlaylist(clips: ClipInfo[], targetDurationS: number): ClipInfo[] {
  const playlist: ClipInfo[] = [];
  let totalDuration = 0;
  const uniqueTotal = clips.reduce((sum, c) => sum + c.durationS, 0);
  const roundsNeeded = Math.ceil(targetDurationS / uniqueTotal);

  for (let round = 0; round < roundsNeeded + 1; round++) {
    const shuffled = [...clips].sort(() => Math.random() - 0.5);
    for (const clip of shuffled) {
      if (playlist.length > 0 && playlist[playlist.length - 1].path === clip.path) {
        continue;
      }
      playlist.push(clip);
      totalDuration += clip.durationS;
      if (totalDuration >= targetDurationS) return playlist;
    }
  }
  return playlist;
}

function renderBackground(
  playlist: ClipInfo[],
  outputPath: string,
  profile: RenderProfile
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = getFFmpegPath();
    const n = playlist.length;
    const w = profile.renderWidth;
    const h = profile.renderHeight;

    const inputArgs: string[] = [];
    for (const clip of playlist) {
      inputArgs.push('-i', clip.path);
    }

    const filterParts: string[] = [];

    for (let i = 0; i < n; i++) {
      const dur = playlist[i].durationS;
      const fadeOutStart = Math.max(0, dur - FADE_S);

      const filters = [
        `scale=${w}:${h}:force_original_aspect_ratio=increase`,
        `crop=${w}:${h}`,
        'setsar=1',
        `fps=${profile.fps}`,
      ];

      if (i > 0) {
        filters.push(`fade=t=in:st=0:d=${FADE_S}`);
      }
      filters.push(`fade=t=out:st=${fadeOutStart}:d=${FADE_S}`);

      filterParts.push(`[${i}:v]${filters.join(',')}[v${i}]`);
    }

    const concatInputs = Array.from({ length: n }, (_, i) => `[v${i}]`).join('');
    filterParts.push(`${concatInputs}concat=n=${n}:v=1:a=0[vout]`);

    const filterComplex = filterParts.join(';');

    const args = [
      ...inputArgs,
      '-filter_complex', filterComplex,
      '-map', '[vout]',
      '-c:v', 'libx264', '-preset', profile.preset, '-crf', String(profile.crf),
      '-pix_fmt', 'yuv420p', '-an',
      '-movflags', '+faststart',
      '-y', outputPath,
    ];

    const proc = spawn(ffmpeg, args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let stderr = '';
    proc.stderr?.on('data', (c: Buffer) => {
      stderr += c.toString();
      if (stderr.length > 3000) stderr = stderr.slice(-1500);
    });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else {
        const errorLines = stderr
          .split('\n')
          .filter((l) => l.includes('Error') || l.includes('error'))
          .slice(-3)
          .join('\n');
        reject(new Error(`Background prep failed (code ${code}): ${errorLines || stderr.slice(-500)}`));
      }
    });
    proc.on('error', (err) => reject(err));
  });
}
