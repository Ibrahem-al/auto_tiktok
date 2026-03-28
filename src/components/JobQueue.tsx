'use client';

import { useJobs } from '@/hooks/useJobs';
import JobCard from './JobCard';

export default function JobQueue() {
  const { jobs, loading } = useJobs();

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="h-24 bg-zinc-800/30 border border-white/5 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <p className="text-lg">No videos yet</p>
        <p className="text-sm mt-1">Add a song to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
