'use client';

import { AppLink } from '@/lib/i18n/navigation';
import { useTranslations } from '@/lib/i18n/locale-provider';

interface ModuleCardProps {
  href: string;
  titleKey: string;
  descriptionKey: string;
  available?: boolean;
  icon: string;
}

export function ModuleCard({
  href,
  titleKey,
  descriptionKey,
  available = false,
  icon,
}: ModuleCardProps) {
  const t = useTranslations('modules');
  const tCommon = useTranslations('common');

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-rl-border bg-rl-surface p-5 shadow-sm transition-all hover:border-rl-accent/40 hover:shadow-md sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <span
          aria-hidden
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-rl-surface-muted text-xl"
        >
          {icon}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            available
              ? 'bg-green-100 text-rl-success'
              : 'bg-rl-surface-muted text-rl-text-muted'
          }`}
        >
          {available ? '●' : tCommon('comingSoon')}
        </span>
      </div>

      <h3 className="text-lg font-bold text-rl-navy">{t(titleKey)}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-rl-text-muted">
        {t(descriptionKey)}
      </p>

      <AppLink
        href={href}
        className={`mt-5 inline-flex items-center gap-1 text-sm font-semibold transition-colors ${
          available
            ? 'text-rl-accent hover:text-rl-accent-hover'
            : 'pointer-events-none text-rl-text-muted'
        }`}
        aria-disabled={!available}
        tabIndex={available ? 0 : -1}
      >
        {tCommon('viewModule')}
        <span aria-hidden>→</span>
      </AppLink>
    </article>
  );
}
