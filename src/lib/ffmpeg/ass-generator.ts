import { TimedLyric, FontPreset } from '@/types';
import { VIDEO_WIDTH, VIDEO_HEIGHT, FONT_COLOR_OPTIONS, TEXT_POSITION_OPTIONS, TEXT_SIZE_OPTIONS } from '../constants';

export interface ASSStyleOverrides {
  fontColor?: string;      // color id from FONT_COLOR_OPTIONS
  textPosition?: string;   // position id from TEXT_POSITION_OPTIONS
  textSize?: string;       // size id from TEXT_SIZE_OPTIONS
}

function msToAssTime(seconds: number): string {
  const totalCs = Math.round(seconds * 100);
  const cs = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const s = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const m = totalMin % 60;
  const h = Math.floor(totalMin / 60);
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

function escapeAssText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}');
}

export function generateASS(
  lyrics: TimedLyric[],
  font: FontPreset,
  overrides: ASSStyleOverrides = {},
  fadeInMs: number = 300,
  fadeOutMs: number = 300
): string {
  const boldFlag = font.bold ? -1 : 0;

  // Resolve color
  const colorOption = FONT_COLOR_OPTIONS.find((c) => c.id === overrides.fontColor)
    || FONT_COLOR_OPTIONS[0]; // default white

  // Resolve position
  const posOption = TEXT_POSITION_OPTIONS.find((p) => p.id === overrides.textPosition)
    || TEXT_POSITION_OPTIONS.find((p) => p.id === 'center')!;

  // Resolve size
  const sizeOption = TEXT_SIZE_OPTIONS.find((s) => s.id === overrides.textSize)
    || TEXT_SIZE_OPTIONS.find((s) => s.id === 'large')!;

  const finalSize = Math.round(font.size * sizeOption.multiplier);
  const finalOutline = Math.max(2, Math.round(font.outline * sizeOption.multiplier));
  const finalMarginV = posOption.marginV;
  const alignment = posOption.alignment;

  const header = `[Script Info]
Title: LyricVision Generated Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709
PlayResX: ${VIDEO_WIDTH}
PlayResY: ${VIDEO_HEIGHT}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Lyric,${font.fontFamily},${finalSize},${colorOption.assColor},&H000000FF,&H00000000,&H96000000,${boldFlag},0,0,0,100,100,0,0,1,${finalOutline},0,${alignment},60,60,${finalMarginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;

  const dialogues = lyrics.map((line) => {
    const start = msToAssTime(line.startTime);
    const end = msToAssTime(line.endTime);
    const safeText = escapeAssText(line.text);
    return `Dialogue: 0,${start},${end},Lyric,,0,0,0,,{\\fad(${fadeInMs},${fadeOutMs})}${safeText}`;
  });

  return header + '\n' + dialogues.join('\n') + '\n';
}
