'use client';

import { useQuery } from '@tanstack/react-query';
import { checkApiHealth } from '@/lib/api/client';
import { getPendingCount } from '@/lib/sync/sync-queue';
import { isOnline } from '@/lib/sync/client-id';
import { useEffect, useState } from 'react';

export function StatusBar() {
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);

  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: checkApiHealth,
    enabled: online,
    retry: false,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    setOnline(isOnline());

    const refreshPending = () => {
      void getPendingCount().then(setPending);
    };

    refreshPending();

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center gap-4 text-xs text-slate-500">
      <span className="flex items-center gap-1.5">
        <span
          className={`h-2 w-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-amber-500'}`}
        />
        {online ? 'En línea' : 'Sin conexión — modo offline'}
      </span>

      {pending > 0 && (
        <span className="text-amber-600">
          {pending} pendiente{pending > 1 ? 's' : ''} de sincronizar
        </span>
      )}

      {health && (
        <span className="hidden sm:inline">API: {health.status}</span>
      )}
    </div>
  );
}
