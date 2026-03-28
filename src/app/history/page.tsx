'use client';

import { useState, useEffect } from 'react';
import { useHistory } from '@/hooks/useHistory';
import { REPEAT_WARNING_DAYS } from '@/lib/constants';
import Link from 'next/link';

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { history, loading } = useHistory(debouncedQuery || undefined);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  function daysAgo(dateStr: string): number {
    return Math.floor(
      (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          Song History
        </h1>
        <p className="text-zinc-400 mt-1">
          All previously generated lyric videos
        </p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search songs or artists..."
          className="w-full px-4 py-3 bg-zinc-800/50 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-zinc-800/30 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <p className="text-lg">No history yet</p>
          <p className="text-sm mt-1">
            Generated videos will appear here
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg transition-colors"
          >
            Generate your first video
          </Link>
        </div>
      ) : (
        <div className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Track
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Artist
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider hidden sm:table-cell">
                  Vibe
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.map((entry) => {
                const days = daysAgo(entry.generated_at);
                const isRecent = days < REPEAT_WARNING_DAYS;

                return (
                  <tr
                    key={entry.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm text-white font-medium">
                        {entry.track_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">
                      {entry.artist_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500 capitalize hidden sm:table-cell">
                      {entry.vibe_keyword}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-400">
                          {new Date(entry.generated_at).toLocaleDateString()}
                        </span>
                        {isRecent && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-500/20 text-amber-400 rounded">
                            {days}d ago
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/?track=${encodeURIComponent(entry.track_name)}&artist=${encodeURIComponent(entry.artist_name)}`}
                        className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        Regenerate
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
