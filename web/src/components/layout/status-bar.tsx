'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from '@/lib/i18n/locale-provider';
import { useEffect, useState } from 'react';
import { checkApiHealth } from '@/lib/api/client';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { getPendingCount } from '@/lib/sync/sync-queue';

export function StatusBar() {
  const t = useTranslations('status');
  const online = useOnlineStatus();
  const [pending, setPending] = useState(0);

  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: checkApiHealth,
    enabled: online,
    retry: false,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    const refreshPending = () => {
      void getPendingCount().then(setPending);
    };

    refreshPending();
    const pendingInterval = window.setInterval(refreshPending, 5_000);

    return () => {
      window.clearInterval(pendingInterval);
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
