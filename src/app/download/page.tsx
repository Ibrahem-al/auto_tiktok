'use client';

const GITHUB_REPO = 'Ibrahem-al/auto_tiktok';
const RELEASES_URL = `https://github.com/${GITHUB_REPO}/releases/latest`;

export default function DownloadPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-4">
          Download LyricVision
        </h1>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto">
          Generate TikTok-ready lyric videos right on your computer.
          No cloud servers, no subscriptions — everything runs locally.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        {/* Windows */}
        <a
          href={`${RELEASES_URL}/download/LyricVision-Setup.exe`}
          className="group block p-6 bg-zinc-900/50 border border-white/5 rounded-2xl hover:border-violet-500/30 transition-all"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-2xl">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-blue-400">
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Windows</h2>
              <p className="text-sm text-zinc-500">Windows 10/11 (64-bit)</p>
            </div>
          </div>
          <div className="text-sm text-violet-400 group-hover:text-violet-300 transition-colors">
            Download .exe installer →
          </div>
        </a>

        {/* macOS */}
        <a
          href={`${RELEASES_URL}/download/LyricVision.dmg`}
          className="group block p-6 bg-zinc-900/50 border border-white/5 rounded-2xl hover:border-violet-500/30 transition-all"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-zinc-500/10 rounded-xl flex items-center justify-center text-2xl">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-zinc-300">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">macOS</h2>
              <p className="text-sm text-zinc-500">Intel & Apple Silicon</p>
            </div>
          </div>
          <div className="text-sm text-violet-400 group-hover:text-violet-300 transition-colors">
            Download .dmg installer →
          </div>
        </a>
      </div>

      {/* What's included */}
      <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">
          What&apos;s included
        </h3>
        <ul className="space-y-2 text-sm text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">&#10003;</span>
            FFmpeg bundled — no separate install needed
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">&#10003;</span>
            8 font presets with color, size, and position controls
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">&#10003;</span>
            20 background vibes including dark/moody options
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">&#10003;</span>
            Seamless multi-clip backgrounds with crossfade
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">&#10003;</span>
            1080x1920 silent MP4 — ready for TikTok
          </li>
        </ul>
      </div>

      {/* Setup note */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-300/80">
        <strong className="text-amber-300">First-time setup:</strong> On first launch, the app
        will ask for your free API keys (Pexels for background videos, Supabase
        for storage). These take 2 minutes to get — the app walks you through it.
      </div>

      <div className="mt-8 text-center">
        <a
          href={`https://github.com/${GITHUB_REPO}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-500 hover:text-zinc-400 transition-colors"
        >
          View source on GitHub →
        </a>
      </div>
    </div>
  );
}
