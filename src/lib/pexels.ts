import { PexelsSearchResponse, PexelsSelection } from '@/types/pexels';
import { PEXELS_BASE_URL } from './constants';

function pickBestFile(video: PexelsSearchResponse['videos'][number]): string | null {
  const suitable = video.video_files
    .filter((f) => f.file_type === 'video/mp4' && f.width >= 720)
    .sort((a, b) => Math.abs(a.width - 1080) - Math.abs(b.width - 1080));
  return suitable[0]?.link || null;
}

async function searchPexelsRaw(
  query: string,
  orientation: 'portrait' | 'landscape' = 'portrait',
  perPage: number = 15
): Promise<PexelsSearchResponse> {
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

  return res.json();
}

export async function searchPexelsVideo(
  query: string,
  orientation: 'portrait' | 'landscape' = 'portrait',
  perPage: number = 15
): Promise<PexelsSelection> {
  const data = await searchPexelsRaw(query, orientation, perPage);

  if (data.videos.length === 0) {
    if (query !== 'scenic nature') {
      return searchPexelsVideo('scenic nature', orientation, perPage);
    }
    throw new Error(`No background videos found for "${query}"`);
  }

  const video = data.videos[Math.floor(Math.random() * data.videos.length)];
  const link = pickBestFile(video);
  if (!link) {
    throw new Error('No suitable HD video file found in Pexels results');
  }

  return {
    videoId: String(video.id),
    downloadUrl: link,
    duration: video.duration,
  };
}

/**
 * Search and return multiple different videos for seamless background compositing.
 * Returns up to `count` unique selections, shuffled randomly.
 */
export async function searchMultiplePexelsVideos(
  query: string,
  count: number = 6,
  orientation: 'portrait' | 'landscape' = 'portrait'
): Promise<PexelsSelection[]> {
  // Fetch more results for better variety
  const data = await searchPexelsRaw(query, orientation, 30);

  let videos = data.videos;

  // If not enough results, try a fallback query too
  if (videos.length < count && query !== 'scenic nature') {
    const fallback = await searchPexelsRaw('scenic nature', orientation, 20);
    videos = [...videos, ...fallback.videos];
  }

  if (videos.length === 0) {
    throw new Error(`No background videos found for "${query}"`);
  }

  // Prefer longer clips (more footage = less repetition)
  // Sort by duration descending, then shuffle within similar-length groups
  videos.sort((a, b) => b.duration - a.duration);

  const selections: PexelsSelection[] = [];
  const usedIds = new Set<number>();

  for (const video of videos) {
    if (selections.length >= count) break;
    if (usedIds.has(video.id)) continue;
    if (video.duration < 8) continue; // skip very short clips

    const link = pickBestFile(video);
    if (!link) continue;

    usedIds.add(video.id);
    selections.push({
      videoId: String(video.id),
      downloadUrl: link,
      duration: video.duration,
    });
  }

  // If we still don't have enough, accept shorter clips
  if (selections.length < 2) {
    for (const video of videos) {
      if (selections.length >= count) break;
      if (usedIds.has(video.id)) continue;

      const link = pickBestFile(video);
      if (!link) continue;

      usedIds.add(video.id);
      selections.push({
        videoId: String(video.id),
        downloadUrl: link,
        duration: video.duration,
      });
    }
  }

  if (selections.length === 0) {
    throw new Error('No suitable HD video files found');
  }

  // Shuffle so the order isn't just longest-first
  return selections.sort(() => Math.random() - 0.5);
}
