'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/components/Toast';
import { VIBE_OPTIONS } from '@/lib/constants';
import { FONT_PRESETS } from '@/lib/fonts';

export default function SettingsPage() {
  const { settings, loading, updateSettings } = useSettings();
  const { toast } = useToast();

  const [syncOffset, setSyncOffset] = useState(0);
  const [defaultVibe, setDefaultVibe] = useState('nature');
  const [defaultFont, setDefaultFont] = useState('montserrat');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setSyncOffset(settings.sync_offset_ms);
      setDefaultVibe(settings.default_vibe);
      setDefaultFont(settings.default_font_preset);
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({
        sync_offset_ms: syncOffset,
        default_vibe: defaultVibe,
        default_font_preset: defaultFont,
      });
      toast('Settings saved', 'success');
    } catch {
      toast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="h-96 bg-zinc-800/30 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-zinc-400 mt-1">
          Configure global preferences for video generation
        </p>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-6">
        {/* Sync Offset */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Sync Offset (milliseconds)
          </label>
          <p className="text-xs text-zinc-500 mb-3">
            Shift all lyric timestamps forward or backward to compensate for
            TikTok&apos;s audio processing delay. Positive values make lyrics appear
            later; negative values make them appear earlier.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSyncOffset((v) => Math.max(-2000, v - 50))}
              className="px-3 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white hover:bg-zinc-700 transition-colors"
            >
              -50
            </button>
            <input
              type="number"
              value={syncOffset}
              onChange={(e) => setSyncOffset(parseInt(e.target.value) || 0)}
              min="-2000"
              max="2000"
              step="50"
              className="w-32 text-center px-3 py-2 bg-zinc-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
            <button
              type="button"
              onClick={() => setSyncOffset((v) => Math.min(2000, v + 50))}
              className="px-3 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white hover:bg-zinc-700 transition-colors"
            >
              +50
            </button>
            <span className="text-sm text-zinc-500">ms</span>
          </div>
        </div>

        {/* Default Vibe */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Default Background Vibe
          </label>
          <select
            value={defaultVibe}
            onChange={(e) => setDefaultVibe(e.target.value)}
            className="w-full px-3 py-2.5 bg-zinc-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            {VIBE_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Default Font */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Default Font Preset
          </label>
          <select
            value={defaultFont}
            onChange={(e) => setDefaultFont(e.target.value)}
            className="w-full px-3 py-2.5 bg-zinc-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            {Object.values(FONT_PRESETS).map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:from-zinc-700 disabled:to-zinc-700 text-white font-medium rounded-lg transition-all"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
