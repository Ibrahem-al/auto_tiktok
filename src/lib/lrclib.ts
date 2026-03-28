import { LRCLibTrack } from '@/types/lrclib';
import { LRCLIB_BASE_URL } from './constants';

export async function getLyrics(
  trackName: string,
  artistName: string
): Promise<LRCLibTrack> {
  const params = new URLSearchParams({
    track_name: trackName,
    artist_name: artistName,
  });

  const res = await fetch(`${LRCLIB_BASE_URL}/get?${params}`, {
    headers: { 'User-Agent': 'LyricVision/1.0' },
  });

  if (res.status === 404) {
    throw new Error(`Song not found: "${trackName}" by "${artistName}"`);
  }
  if (!res.ok) {
    throw new Error(`LRCLIB error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function searchLyrics(query: string): Promise<LRCLibTrack[]> {
  const params = new URLSearchParams({ q: query, limit: '10' });

  const res = await fetch(`${LRCLIB_BASE_URL}/search?${params}`, {
    headers: { 'User-Agent': 'LyricVision/1.0' },
  });

  if (!res.ok) {
    throw new Error(`LRCLIB search error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Attempts to get synced lyrics for a song.
 * First tries the direct /get endpoint, then falls back to search.
 */
export async function fetchSyncedLyrics(
  trackName: string,
  artistName: string
): Promise<LRCLibTrack> {
  // Try direct get first
  try {
    const track = await getLyrics(trackName, artistName);

    if (track.syncedLyrics) return track;

    // Has plain lyrics but no synced — try search fallback
    if (track.plainLyrics) {
      const searchResults = await searchLyrics(`${trackName} ${artistName}`);
      const synced = searchResults.find((t) => t.syncedLyrics);
      if (synced) return synced;

      throw new Error(
        `Only plain (unsynced) lyrics found for "${trackName}" by "${artistName}". ` +
        'Synced lyrics with timestamps are required to generate a timed video.'
      );
    }

    throw new Error(
      `No lyrics found for "${trackName}" by "${artistName}". ` +
      'Check the spelling or try the song\'s official title.'
    );
  } catch (err) {
    // If direct get returned 404, try search
    if (err instanceof Error && err.message.startsWith('Song not found')) {
      const searchResults = await searchLyrics(`${trackName} ${artistName}`);
      const synced = searchResults.find((t) => t.syncedLyrics);
      if (synced) return synced;

      if (searchResults.length > 0) {
        throw new Error(
          `Found "${trackName}" but no synced lyrics are available. ` +
          'Try a different version or spelling of the song.'
        );
      }

      throw new Error(
        `No results found for "${trackName}" by "${artistName}". ` +
        'Check the spelling or try the song\'s official title.'
      );
    }
    throw err;
  }
}
