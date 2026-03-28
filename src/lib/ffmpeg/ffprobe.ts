import { execFile } from 'child_process';
import { promisify } from 'util';
import { getFFprobePath } from './ffmpeg-path';

const execFileAsync = promisify(execFile);

export interface VideoInfo {
  width: number;
  height: number;
  durationSec: number;
  codec: string;
  fps: number;
}

export async function probeVideo(videoPath: string): Promise<VideoInfo> {
  try {
    const ffprobeBin = getFFprobePath();
    const { stdout } = await execFileAsync(ffprobeBin, [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      videoPath,
    ]);

    const data = JSON.parse(stdout);
    const videoStream = data.streams?.find(
      (s: { codec_type: string }) => s.codec_type === 'video'
    );

    if (!videoStream) {
      throw new Error('No video stream found in input file');
    }

    const [num, den] = (videoStream.r_frame_rate || '30/1').split('/').map(Number);
    const fps = den ? num / den : num;

    return {
      width: videoStream.width,
      height: videoStream.height,
      durationSec: parseFloat(data.format?.duration || '0'),
      codec: videoStream.codec_name,
      fps: Math.round(fps * 100) / 100,
    };
  } catch (err) {
    if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(
        'FFmpeg/FFprobe not found. Please install FFmpeg and ensure it is in your system PATH.'
      );
    }
    throw err;
  }
}
