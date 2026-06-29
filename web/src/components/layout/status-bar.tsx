'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from '@/lib/i18n/locale-provider';
import { useEffect, useState } from 'react';
import { checkApiHealth } from '@/lib/api/client';
import { isOnline } from '@/lib/sync/client-id';
import { getPendingCount } from '@/lib/sync/sync-queue';

export function StatusBar() {
  const t = useTranslations('status');
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
    <div
      className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-rl-text-muted"
      role="status"
      aria-live="polite"
    >
      <span className="inline-flex items-center gap-1.5 font-medium">
        <span
          className={`h-2 w-2 rounded-full ${online ? 'bg-rl-success' : 'bg-rl-warning'}`}
          aria-hidden
        />
        {online ? t('online') : t('offline')}
      </span>

      {pending > 0 && (
        <span className="font-medium text-rl-warning">
          {t('pendingSync', { count: pending })}
        </span>
      )}

      {health && online && (
        <span className="hidden sm:inline">{t('apiOk')}</span>
      )}
    </div>
  );
}
