import { TimedLyric } from '@/types';
import { MAX_LYRIC_DISPLAY_S, MIN_LYRIC_DISPLAY_S, LAST_LYRIC_HOLD_S } from './constants';

const TIME_REGEX = /^\[(\d{2}):(\d{2})\.(\d{2,3})\]\s*(.*)$/;
const METADATA_REGEX = /^\[[a-z]{2}:/i;

function parseTimestamp(mm: string, ss: string, ms: string): number {
  const minutes = parseInt(mm, 10);
  const seconds = parseInt(ss, 10);
  // Handle both centiseconds (2 digits) and milliseconds (3 digits)
  const frac = ms.length === 2
    ? parseInt(ms, 10) / 100
    : parseInt(ms, 10) / 1000;
  return minutes * 60 + seconds + frac;
}

export function parseLRC(lrcString: string, offsetMs: number = 0): TimedLyric[] {
  const lines = lrcString.split('\n');
  const offsetS = offsetMs / 1000;

  const raw: { time: number; text: string }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || METADATA_REGEX.test(trimmed)) continue;

    const match = trimmed.match(TIME_REGEX);
    if (!match) continue;

    const [, mm, ss, ms, text] = match;
    const cleanText = text.trim();
    if (!cleanText) continue;

    const time = parseTimestamp(mm, ss, ms) + offsetS;
    if (time < 0) continue;

    raw.push({ time, text: cleanText });
  }

  if (raw.length === 0) return [];

  // Sort by time (should already be sorted, but just in case)
  raw.sort((a, b) => a.time - b.time);

  const lyrics: TimedLyric[] = raw.map((entry, i) => {
    const startTime = entry.time;
    let endTime: number;

    if (i < raw.length - 1) {
      endTime = raw[i + 1].time;
    } else {
      endTime = startTime + LAST_LYRIC_HOLD_S;
    }

    // Clamp display duration
    const duration = endTime - startTime;
    if (duration < MIN_LYRIC_DISPLAY_S) {
      endTime = startTime + MIN_LYRIC_DISPLAY_S;
    } else if (duration > MAX_LYRIC_DISPLAY_S) {
      endTime = startTime + MAX_LYRIC_DISPLAY_S;
    }

    return { startTime, endTime, text: entry.text };
  });

  return lyrics;
}

export function filterByClipRange(
  lyrics: TimedLyric[],
  startS: number,
  endS: number
): TimedLyric[] {
  return lyrics
    .filter((l) => l.endTime > startS && l.startTime < endS)
    .map((l) => ({
      startTime: Math.max(0, l.startTime - startS),
      endTime: Math.min(endS - startS, l.endTime - startS),
      text: l.text,
    }));
}

export function getTotalDuration(lyrics: TimedLyric[]): number {
  if (lyrics.length === 0) return 0;
  return lyrics[lyrics.length - 1].endTime;
}

/**
 * Splits lyrics into smaller word groups while preserving sync.
 *
 * wordsPerLine = 0 means "full line" (no splitting).
 * wordsPerLine = 1 means word-by-word.
 * wordsPerLine = 3 means 3 words at a time.
 *
 * Time is distributed evenly across sub-segments within each
 * original line's time window, so sync is always maintained.
 */
export function splitByWordCount(
  lyrics: TimedLyric[],
  wordsPerLine: number
): TimedLyric[] {
  if (wordsPerLine <= 0) return lyrics; // 0 = full line, no splitting

  const result: TimedLyric[] = [];

  for (const line of lyrics) {
    const words = line.text.split(/\s+/).filter((w) => w.length > 0);

    if (words.length <= wordsPerLine) {
      // Line already fits within the word limit
      result.push(line);
      continue;
    }

    // Split words into chunks
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += wordsPerLine) {
      chunks.push(words.slice(i, i + wordsPerLine).join(' '));
    }

    // Distribute time evenly across chunks
    const totalDuration = line.endTime - line.startTime;
    const chunkDuration = totalDuration / chunks.length;

    for (let i = 0; i < chunks.length; i++) {
      result.push({
        startTime: line.startTime + i * chunkDuration,
        endTime: line.startTime + (i + 1) * chunkDuration,
        text: chunks[i],
      });
    }
  }

  return result;
}
