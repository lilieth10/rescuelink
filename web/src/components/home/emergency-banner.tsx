'use client';

import { useTranslations } from '@/lib/i18n/locale-provider';
import type { Emergency } from '@/lib/api/emergencies';

interface EmergencyBannerProps {
  emergency: Emergency;
}

export function EmergencyBanner({ emergency }: EmergencyBannerProps) {
  const t = useTranslations('home');

  return (
    <div
      className="flex flex-col gap-2 rounded-xl border border-rl-accent/30 bg-rl-accent-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rl-accent text-sm text-white"
        >
          !
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-rl-accent">
            {t('activeEmergency')}
          </p>
          <p className="font-semibold text-rl-text">{emergency.name}</p>
          <p className="text-sm text-rl-text-muted">
            {emergency.country.name} · {emergency.type}
          </p>
        </div>
      </div>
      <span className="inline-flex w-fit items-center rounded-full bg-rl-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
        {emergency.status}
      </span>
    </div>
  );
}
