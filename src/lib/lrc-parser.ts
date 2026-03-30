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
 * Splits lyrics into smaller word groups and optionally accumulates
 * them on screen before clearing.
 *
 * wordsPerLine: 0 = full line (no splitting), 1 = word-by-word, N = N words at a time
 * linesBeforeClear: how many original lyric lines to accumulate before clearing.
 *   1 = words build up within one line, then clear for the next line (default)
 *   2 = words build up across 2 lines, then clear
 *   0 = no accumulation (each chunk replaces the previous one)
 */
export function splitByWordCount(
  lyrics: TimedLyric[],
  wordsPerLine: number,
  linesBeforeClear: number = 1
): TimedLyric[] {
  if (wordsPerLine <= 0 && linesBeforeClear <= 1) return lyrics;

  // Step 1: Split each line into word chunks with timed segments
  const linesWithChunks: { chunks: TimedLyric[]; originalIndex: number }[] = [];

  for (let li = 0; li < lyrics.length; li++) {
    const line = lyrics[li];
    const words = line.text.split(/\s+/).filter((w) => w.length > 0);

    if (wordsPerLine <= 0 || words.length <= wordsPerLine) {
      linesWithChunks.push({
        chunks: [{ ...line }],
        originalIndex: li,
      });
      continue;
    }

    const rawChunks: string[] = [];
    for (let i = 0; i < words.length; i += wordsPerLine) {
      rawChunks.push(words.slice(i, i + wordsPerLine).join(' '));
    }

    const totalDuration = line.endTime - line.startTime;
    const chunkDuration = totalDuration / rawChunks.length;

    const chunks: TimedLyric[] = rawChunks.map((text, i) => ({
      startTime: line.startTime + i * chunkDuration,
      endTime: line.startTime + (i + 1) * chunkDuration,
      text,
    }));

    linesWithChunks.push({ chunks, originalIndex: li });
  }

  // Step 2: If no accumulation, just flatten and return
  if (linesBeforeClear <= 0) {
    return linesWithChunks.flatMap((l) => l.chunks);
  }

  // Step 3: Accumulate words within groups of N original lines
  const result: TimedLyric[] = [];
  const groupSize = linesBeforeClear;

  for (let groupStart = 0; groupStart < linesWithChunks.length; groupStart += groupSize) {
    const groupEnd = Math.min(groupStart + groupSize, linesWithChunks.length);
    const groupLines = linesWithChunks.slice(groupStart, groupEnd);

    // Collect all chunks in this group
    const allChunks = groupLines.flatMap((l) => l.chunks);

    // Build accumulated entries: each one shows all text up to that point
    let accumulated = '';
    for (let i = 0; i < allChunks.length; i++) {
      if (accumulated) {
        accumulated += '\n' + allChunks[i].text;
      } else {
        accumulated = allChunks[i].text;
      }

      result.push({
        startTime: allChunks[i].startTime,
        endTime: allChunks[i].endTime,
        text: accumulated,
      });
    }
  }

  return result;
}
