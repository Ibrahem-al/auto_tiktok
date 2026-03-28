import fs from 'fs';
import path from 'path';

const KNOWN_LOCATIONS = [
  'C:\\Users\\ibrah\\ffmpeg\\ffmpeg.exe',
  'C:\\ffmpeg\\bin\\ffmpeg.exe',
  'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
];

const KNOWN_PROBE_LOCATIONS = [
  'C:\\Users\\ibrah\\ffmpeg\\ffprobe.exe',
  'C:\\ffmpeg\\bin\\ffprobe.exe',
  'C:\\Program Files\\ffmpeg\\bin\\ffprobe.exe',
];

let cachedFFmpegPath: string | null = null;
let cachedFFprobePath: string | null = null;

export function getFFmpegPath(): string {
  if (cachedFFmpegPath) return cachedFFmpegPath;

  for (const loc of KNOWN_LOCATIONS) {
    if (fs.existsSync(loc)) {
      cachedFFmpegPath = loc;
      return loc;
    }
  }

  // Fallback to bare name (hope it's in PATH)
  cachedFFmpegPath = 'ffmpeg';
  return 'ffmpeg';
}

export function getFFprobePath(): string {
  if (cachedFFprobePath) return cachedFFprobePath;

  for (const loc of KNOWN_PROBE_LOCATIONS) {
    if (fs.existsSync(loc)) {
      cachedFFprobePath = loc;
      return loc;
    }
  }

  cachedFFprobePath = 'ffprobe';
  return 'ffprobe';
}
