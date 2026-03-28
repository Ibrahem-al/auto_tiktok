'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Job } from '@/types';

const ACTIVE_POLL_MS = 2000;
const IDLE_POLL_MS = 10000;

const ACTIVE_STATUSES = new Set([
  'queued',
  'fetching_lyrics',
  'selecting_background',
  'downloading_background',
  'rendering',
]);

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentIntervalMs = useRef(IDLE_POLL_MS);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs?limit=20');
      if (res.ok) {
        const data: Job[] = await res.json();
        setJobs(data);

        // Adjust polling rate based on whether any jobs are active
        const hasActive = data.some((j) => ACTIVE_STATUSES.has(j.status));
        const desiredInterval = hasActive ? ACTIVE_POLL_MS : IDLE_POLL_MS;

        if (desiredInterval !== currentIntervalMs.current) {
          currentIntervalMs.current = desiredInterval;
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          intervalRef.current = setInterval(fetchJobs, desiredInterval);
        }
      }
    } catch {
      // Silently fail on poll errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    intervalRef.current = setInterval(fetchJobs, IDLE_POLL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchJobs]);

  return { jobs, loading, refetch: fetchJobs };
}
