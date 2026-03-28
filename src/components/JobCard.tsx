'use client';

import { Job } from '@/types';
import { useToast } from './Toast';

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; showProgress: boolean }
> = {
  queued: { label: 'Queued', color: 'bg-zinc-500', showProgress: false },
  fetching_lyrics: {
    label: 'Fetching lyrics...',
    color: 'bg-blue-500',
    showProgress: false,
  },
  selecting_background: {
    label: 'Finding background...',
    color: 'bg-blue-500',
    showProgress: false,
  },
  downloading_background: {
    label: 'Downloading clip...',
    color: 'bg-blue-500',
    showProgress: false,
  },
  rendering: {
    label: 'Rendering',
    color: 'bg-amber-500',
    showProgress: true,
  },
  completed: { label: 'Done', color: 'bg-emerald-500', showProgress: false },
  failed: { label: 'Failed', color: 'bg-red-500', showProgress: false },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function JobCard({ job }: { job: Job }) {
  const { toast } = useToast();
  const config = STATUS_CONFIG[job.status] || STATUS_CONFIG.queued;
  const isActive = !['completed', 'failed'].includes(job.status);

  const handleCancel = async () => {
    try {
      await fetch(`/api/jobs/${job.id}`, { method: 'DELETE' });
      toast('Job cancelled', 'success');
    } catch {
      toast('Failed to cancel job', 'error');
    }
  };

  const handleDownload = () => {
    window.open(`/api/jobs/${job.id}/download`, '_blank');
  };

  const handleCopySound = () => {
    navigator.clipboard.writeText(`${job.track_name} - ${job.artist_name}`);
    toast('Sound name copied to clipboard', 'success');
  };

  return (
    <div className="p-4 bg-zinc-800/50 border border-white/5 rounded-xl space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-medium text-white truncate">{job.track_name}</h3>
          <p className="text-sm text-zinc-400 truncate">{job.artist_name}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${config.color}`}
          >
            {config.label}
            {config.showProgress && ` ${job.progress}%`}
          </span>
          <span className="text-xs text-zinc-500">
            {timeAgo(job.created_at)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      {config.showProgress && (
        <div className="w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${job.progress}%` }}
          />
        </div>
      )}

      {/* Error message */}
      {job.status === 'failed' && job.error_message && (
        <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
          {job.error_message}
        </p>
      )}

      {/* Completed: TikTok sound card + download */}
      {job.status === 'completed' && (
        <div className="space-y-2">
          <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-3 space-y-2">
            <p className="text-xs text-zinc-400">
              Search for this sound on TikTok:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm text-violet-300 bg-violet-500/10 px-2 py-1 rounded truncate">
                {job.track_name} - {job.artist_name}
              </code>
              <button
                onClick={handleCopySound}
                className="shrink-0 px-2 py-1 text-xs text-zinc-400 hover:text-white border border-white/10 rounded transition-colors"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-zinc-500">
              Start the sound at 0:00 for perfect sync
            </p>
          </div>

          <button
            onClick={handleDownload}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Download Video
          </button>
        </div>
      )}

      {/* Cancel button for active jobs */}
      {isActive && (
        <button
          onClick={handleCancel}
          className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
