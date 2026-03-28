import { PexelsSearchResponse, PexelsSelection } from '@/types/pexels';
import { PEXELS_BASE_URL } from './constants';

export async function searchPexelsVideo(
  query: string,
  orientation: 'portrait' | 'landscape' = 'portrait',
  perPage: number = 15
): Promise<PexelsSelection> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    throw new Error('PEXELS_API_KEY environment variable is not set');
  }

  const params = new URLSearchParams({
    query,
    orientation,
    per_page: String(perPage),
  });

  const res = await fetch(`${PEXELS_BASE_URL}/videos/search?${params}`, {
    headers: { Authorization: apiKey },
  });

  if (res.status === 429) {
    throw new Error(
      'Pexels rate limit exceeded (200 requests/hour). Please try again later.'
    );
  }
  if (!res.ok) {
    throw new Error(`Pexels API error: ${res.status} ${res.statusText}`);
  }

  const data: PexelsSearchResponse = await res.json();

  if (data.videos.length === 0) {
    // Fallback to generic "scenic nature" query
    if (query !== 'scenic nature') {
      return searchPexelsVideo('scenic nature', orientation, perPage);
    }
    throw new Error(`No background videos found for "${query}"`);
  }

  // Pick a random video
  const video = data.videos[Math.floor(Math.random() * data.videos.length)];

  // Find best file: HD, MP4, closest to 1080px width
  const suitable = video.video_files
    .filter((f) => f.file_type === 'video/mp4' && f.width >= 720)
    .sort((a, b) => Math.abs(a.width - 1080) - Math.abs(b.width - 1080));

  const file = suitable[0];
  if (!file) {
    throw new Error('No suitable HD video file found in Pexels results');
  }

  return {
    videoId: String(video.id),
    downloadUrl: file.link,
    duration: video.duration,
  };
}
