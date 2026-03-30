'use client';

import { useState } from 'react';
import { VIBE_OPTIONS, FONT_COLOR_OPTIONS, TEXT_POSITION_OPTIONS, TEXT_SIZE_OPTIONS } from '@/lib/constants';
import { FONT_PRESETS } from '@/lib/fonts';
import { useToast } from './Toast';

interface Props {
  onJobCreated?: () => void;
}

export default function SongInputForm({ onJobCreated }: Props) {
  const { toast } = useToast();
  const [trackName, setTrackName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [vibeKeyword, setVibeKeyword] = useState('nature');
  const [fontPreset, setFontPreset] = useState('montserrat');
  const [fontColor, setFontColor] = useState('white');
  const [textPosition, setTextPosition] = useState('center');
  const [textSize, setTextSize] = useState('large');
  const [blurAmount, setBlurAmount] = useState(3);
  const [wordsPerLine, setWordsPerLine] = useState(0);
  const [linesBeforeClear, setLinesBeforeClear] = useState(1);
  const [clipStartS, setClipStartS] = useState('');
  const [clipEndS, setClipEndS] = useState('');
  const [showColors, setShowColors] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedColor = FONT_COLOR_OPTIONS.find((c) => c.id === fontColor) || FONT_COLOR_OPTIONS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackName.trim() || !artistName.trim()) return;

    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        trackName: trackName.trim(),
        artistName: artistName.trim(),
        vibeKeyword,
        fontPreset,
        fontColor,
        textPosition,
        textSize,
        blurAmount,
        wordsPerLine,
        linesBeforeClear,
      };

      if (clipStartS) body.clipStartS = parseFloat(clipStartS);
      if (clipEndS) body.clipEndS = parseFloat(clipEndS);

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast(data.error || 'Failed to create job', 'error');
        return;
      }

      if (data.warning) {
        toast(data.warning, 'warning');
      } else {
        toast(`Queued "${trackName}" by ${artistName}`, 'success');
      }

      setTrackName('');
      setArtistName('');
      setClipStartS('');
      setClipEndS('');
      onJobCreated?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast(`Failed to create job: ${message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        {/* Song + Artist */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Song Name
          </label>
          <input
            type="text"
            value={trackName}
            onChange={(e) => setTrackName(e.target.value)}
            placeholder="Espresso"
            className="w-full px-3 py-2.5 bg-zinc-800/50 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Artist
          </label>
          <input
            type="text"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            placeholder="Sabrina Carpenter"
            className="w-full px-3 py-2.5 bg-zinc-800/50 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
          />
        </div>

        {/* Vibe + Font */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Background Vibe
            </label>
            <select
              value={vibeKeyword}
              onChange={(e) => setVibeKeyword(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
            >
              {VIBE_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Font
            </label>
            <select
              value={fontPreset}
              onChange={(e) => setFontPreset(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
            >
              {Object.values(FONT_PRESETS).map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Text Color — collapsible */}
        <div>
          <button
            type="button"
            onClick={() => setShowColors(!showColors)}
            className="flex items-center gap-2 w-full px-3 py-2.5 bg-zinc-800/50 border border-white/10 rounded-lg text-sm transition-colors hover:bg-zinc-800"
          >
            <span
              className="w-4 h-4 rounded-full border border-white/20 shrink-0"
              style={{ backgroundColor: selectedColor.hex }}
            />
            <span className="text-zinc-300">
              Text Color: <span className="text-white">{selectedColor.label}</span>
            </span>
            <svg
              className={`w-4 h-4 text-zinc-500 ml-auto transition-transform ${showColors ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showColors && (
            <div className="flex flex-wrap gap-2 mt-2 p-3 bg-zinc-800/30 rounded-lg border border-white/5">
              {FONT_COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setFontColor(c.id);
                    setShowColors(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    fontColor === c.id
                      ? 'bg-white/15 ring-2 ring-violet-500/60'
                      : 'bg-zinc-800/50 hover:bg-zinc-700'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-zinc-300">{c.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text Position + Size */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Text Position
            </label>
            <select
              value={textPosition}
              onChange={(e) => setTextPosition(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
            >
              {TEXT_POSITION_OPTIONS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Text Size
            </label>
            <select
              value={textSize}
              onChange={(e) => setTextSize(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
            >
              {TEXT_SIZE_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Background Blur */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Background Blur{' '}
            <span className="text-zinc-500 font-normal">
              ({blurAmount === 0 ? 'Off' : blurAmount})
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="15"
            step="0.5"
            value={blurAmount}
            onChange={(e) => setBlurAmount(parseFloat(e.target.value))}
            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
          <div className="relative h-4 text-xs text-zinc-500 mt-1">
            <span className="absolute left-0">None</span>
            <span className="absolute left-1/2 -translate-x-1/2">Subtle</span>
            <span className="absolute right-0">Heavy</span>
          </div>
        </div>

        {/* Words Per Line */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Words at a time{' '}
            <span className="text-zinc-500 font-normal">
              ({wordsPerLine === 0 ? 'Full line' : wordsPerLine === 1 ? '1 word' : `${wordsPerLine} words`})
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={wordsPerLine}
            onChange={(e) => setWordsPerLine(parseInt(e.target.value))}
            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
          <div className="relative h-4 text-xs text-zinc-500 mt-1">
            <span className="absolute left-0">Full line</span>
            <span className="absolute left-[10%]">1</span>
            <span className="absolute left-1/2 -translate-x-1/2">5</span>
            <span className="absolute right-0">10</span>
          </div>
        </div>

        {/* Lines Before Clear */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Lines on screen{' '}
            <span className="text-zinc-500 font-normal">
              ({linesBeforeClear === 0
                ? 'Replace each'
                : linesBeforeClear === 1
                  ? '1 line, then clear'
                  : `${linesBeforeClear} lines, then clear`})
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="6"
            step="1"
            value={linesBeforeClear}
            onChange={(e) => setLinesBeforeClear(parseInt(e.target.value))}
            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
          <div className="relative h-4 text-xs text-zinc-500 mt-1">
            <span className="absolute left-0">Replace</span>
            <span className="absolute left-[16.7%] -translate-x-1/2">1</span>
            <span className="absolute left-1/2 -translate-x-1/2">3</span>
            <span className="absolute right-0">6</span>
          </div>
          {wordsPerLine > 0 && linesBeforeClear > 0 && (
            <p className="text-xs text-zinc-600 mt-2">
              Words build up on screen, then clear after {linesBeforeClear} line{linesBeforeClear !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Clip Range (Advanced) */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            {showAdvanced ? 'Hide' : 'Show'} clip range options
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  Start (seconds)
                </label>
                <input
                  type="number"
                  value={clipStartS}
                  onChange={(e) => setClipStartS(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 bg-zinc-800/50 border border-white/10 rounded-lg text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  End (seconds)
                </label>
                <input
                  type="number"
                  value={clipEndS}
                  onChange={(e) => setClipEndS(e.target.value)}
                  placeholder="e.g. 105"
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 bg-zinc-800/50 border border-white/10 rounded-lg text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={!trackName.trim() || !artistName.trim() || submitting}
        className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500 text-white font-medium rounded-lg transition-all"
      >
        {submitting ? 'Creating...' : 'Generate Video'}
      </button>
    </form>
  );
}
