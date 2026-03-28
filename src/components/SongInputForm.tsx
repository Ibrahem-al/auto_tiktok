'use client';

import { useState } from 'react';
import { VIBE_OPTIONS } from '@/lib/constants';
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
  const [clipStartS, setClipStartS] = useState('');
  const [clipEndS, setClipEndS] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    } catch {
      toast('Failed to create job', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
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
