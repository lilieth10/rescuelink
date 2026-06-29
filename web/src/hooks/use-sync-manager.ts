'use client';

import { useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { runSyncCycle } from '@/lib/sync/sync-engine';
import { isOnline } from '@/lib/sync/client-id';

const SYNC_INTERVAL_MS = 30_000;

export function useSyncManager(): void {
  const queryClient = useQueryClient();

  const sync = useCallback(async () => {
    await runSyncCycle();
    await queryClient.invalidateQueries({ queryKey: ['missing-persons'] });
    await queryClient.invalidateQueries({ queryKey: ['sync-pending'] });
  }, [queryClient]);

  useEffect(() => {
    void sync();

    const handleOnline = () => {
      void sync();
    };

    window.addEventListener('online', handleOnline);

    const interval = window.setInterval(() => {
      if (isOnline()) void sync();
    }, SYNC_INTERVAL_MS);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.clearInterval(interval);
    };
  }, [sync]);
}
