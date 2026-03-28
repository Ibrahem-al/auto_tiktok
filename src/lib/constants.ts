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
  'dark moody',
  'foggy',
  'thunderstorm',
  'candlelight',
  'midnight city',
  'dark forest',
  'smoke',
] as const;

export type VibeOption = (typeof VIBE_OPTIONS)[number];

// Font color options — label + ASS hex color (&HAABBGGRR format)
export const FONT_COLOR_OPTIONS = [
  { id: 'white', label: 'White', hex: '#FFFFFF', assColor: '&H00FFFFFF' },
  { id: 'yellow', label: 'Yellow', hex: '#FFD700', assColor: '&H0000D7FF' },
  { id: 'cyan', label: 'Cyan', hex: '#00FFFF', assColor: '&H00FFFF00' },
  { id: 'pink', label: 'Pink', hex: '#FF69B4', assColor: '&H00B469FF' },
  { id: 'lime', label: 'Lime', hex: '#00FF00', assColor: '&H0000FF00' },
  { id: 'orange', label: 'Orange', hex: '#FF8C00', assColor: '&H00008CFF' },
  { id: 'lavender', label: 'Lavender', hex: '#E6E6FA', assColor: '&H00FAE6E6' },
  { id: 'red', label: 'Red', hex: '#FF4444', assColor: '&H004444FF' },
  { id: 'gold', label: 'Gold', hex: '#FFD700', assColor: '&H0000D7FF' },
  { id: 'ice-blue', label: 'Ice Blue', hex: '#ADD8E6', assColor: '&H00E6D8AD' },
] as const;

// Text position options — maps to ASS alignment values
// ASS alignment: 1-3 = bottom, 4-6 = middle, 7-9 = top (left/center/right)
export const TEXT_POSITION_OPTIONS = [
  { id: 'top', label: 'Top', alignment: 8, marginV: 100 },
  { id: 'upper', label: 'Upper Third', alignment: 8, marginV: 320 },
  { id: 'center', label: 'Center', alignment: 5, marginV: 0 },
  { id: 'lower', label: 'Lower Third', alignment: 2, marginV: 320 },
  { id: 'bottom', label: 'Bottom', alignment: 2, marginV: 100 },
] as const;

// Text size multipliers
export const TEXT_SIZE_OPTIONS = [
  { id: 'small', label: 'Small', multiplier: 0.7 },
  { id: 'medium', label: 'Medium', multiplier: 0.85 },
  { id: 'large', label: 'Large', multiplier: 1.0 },
  { id: 'xl', label: 'Extra Large', multiplier: 1.2 },
  { id: 'xxl', label: 'Huge', multiplier: 1.45 },
] as const;
