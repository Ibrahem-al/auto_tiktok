'use client';

import { useState, useEffect, useCallback } from 'react';
import { SongHistory } from '@/types';

export function useHistory(query?: string) {
  const [history, setHistory] = useState<SongHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (query) params.set('q', query);
      const res = await fetch(`/api/history?${params}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, refetch: fetchHistory };
}
