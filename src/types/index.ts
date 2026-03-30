export type JobStatus =
  | 'queued'
  | 'fetching_lyrics'
  | 'selecting_background'
  | 'downloading_background'
  | 'rendering'
  | 'completed'
  | 'failed';

export interface Job {
  id: string;
  track_name: string;
  artist_name: string;
  vibe_keyword: string;
  font_preset: string;
  font_color: string;
  text_position: string;
  text_size: string;
  blur_amount: number;
  clip_start_s: number | null;
  clip_end_s: number | null;
  status: JobStatus;
  progress: number;
  error_message: string | null;
  output_path: string | null;
  lyrics_data: TimedLyric[] | null;
  pexels_video_id: string | null;
  duration_s: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface SongHistory {
  id: string;
  job_id: string;
  track_name: string;
  artist_name: string;
  album_name: string | null;
  duration_s: number | null;
  vibe_keyword: string | null;
  font_preset: string | null;
  output_path: string | null;
  generated_at: string;
}

export interface Settings {
  id: number;
  sync_offset_ms: number;
  default_vibe: string;
  default_font_preset: string;
  updated_at: string;
}

export interface TimedLyric {
  startTime: number; // seconds
  endTime: number;   // seconds
  text: string;
}

export interface FontPreset {
  id: string;
  name: string;
  fontFamily: string;
  fileName: string;
  size: number;
  bold: boolean;
  outline: number;
  marginV: number;
}
