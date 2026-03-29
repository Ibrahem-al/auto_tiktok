import os from 'os';

export interface RenderProfile {
  /** Resolution to render at internally */
  renderWidth: number;
  renderHeight: number;
  /** Final output resolution (upscaled if different from render) */
  outputWidth: number;
  outputHeight: number;
  /** Number of background clips to download */
  clipCount: number;
  /** FFmpeg encoding preset */
  preset: string;
  /** Constant Rate Factor (quality) */
  crf: number;
  /** Frame rate */
  fps: number;
  /** Apply background blur */
  blur: boolean;
  /** Profile name for logging */
  name: string;
}

const FULL_PROFILE: RenderProfile = {
  renderWidth: 1080,
  renderHeight: 1920,
  outputWidth: 1080,
  outputHeight: 1920,
  clipCount: 6,
  preset: 'medium',
  crf: 23,
  fps: 30,
  blur: true,
  name: 'full',
};

const LOW_MEM_PROFILE: RenderProfile = {
  renderWidth: 720,
  renderHeight: 1280,
  outputWidth: 1080,
  outputHeight: 1920,
  clipCount: 2,
  preset: 'ultrafast',
  crf: 26,
  fps: 24,
  blur: false,
  name: 'low-memory',
};

/**
 * Auto-detect which profile to use based on available system memory.
 * < 1GB total RAM → low memory mode
 */
export function getProfile(): RenderProfile {
  const totalMemMB = os.totalmem() / (1024 * 1024);

  if (totalMemMB < 1024) {
    console.log(`[RenderProfile] Low memory detected (${Math.round(totalMemMB)}MB) — using low-memory profile`);
    return LOW_MEM_PROFILE;
  }

  console.log(`[RenderProfile] ${Math.round(totalMemMB)}MB RAM — using full profile`);
  return FULL_PROFILE;
}
