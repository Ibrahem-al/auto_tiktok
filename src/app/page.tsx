'use client';

import SongInputForm from '@/components/SongInputForm';
import JobQueue from '@/components/JobQueue';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          Generate Lyric Videos
        </h1>
        <p className="text-zinc-400 mt-1">
          Enter a song and artist to create a TikTok-ready lyric video
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <div className="sticky top-24">
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                New Video
              </h2>
              <SongInputForm />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <h2 className="text-lg font-semibold text-white mb-4">
            Generation Queue
          </h2>
          <JobQueue />
        </div>
      </div>
    </div>
  );
}
