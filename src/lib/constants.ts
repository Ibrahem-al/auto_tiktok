// Shared constants (safe for both client and server)

export const LRCLIB_BASE_URL = 'https://lrclib.net/api';
export const PEXELS_BASE_URL = 'https://api.pexels.com';

export const REPEAT_WARNING_DAYS = 30;
export const JOB_POLL_INTERVAL_MS = 2000;
export const MAX_LYRIC_DISPLAY_S = 8;
export const MIN_LYRIC_DISPLAY_S = 0.5;
export const LAST_LYRIC_HOLD_S = 4;

export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
export const VIDEO_FPS = 30;
export const VIDEO_CRF = 23;
export const VIDEO_PRESET = 'medium';

export const VIBE_OPTIONS = [
  'nature',
  'ocean',
  'city',
  'rain',
  'sunset',
  'northern lights',
  'aerial',
  'fireplace',
  'clouds',
  'forest',
  'neon',
  'space',
  'abstract',
] as const;

export type VibeOption = (typeof VIBE_OPTIONS)[number];
