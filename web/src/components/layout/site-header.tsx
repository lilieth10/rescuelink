'use client';

import { AppLink } from '@/lib/i18n/navigation';
import { useTranslations } from '@/lib/i18n/locale-provider';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { StatusBar } from '@/components/layout/status-bar';

export function SiteHeader() {
  const t = useTranslations('common');

  return (
    <header className="sticky top-0 z-50 border-b border-rl-border bg-rl-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
        <AppLink href="/" className="group flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rl-accent text-lg font-bold text-white shadow-sm"
          >
            R
          </span>
          <span>
            <span className="block text-xs font-semibold uppercase tracking-wider text-rl-accent">
              {t('tagline')}
            </span>
            <span className="block text-xl font-bold tracking-tight text-rl-navy group-hover:text-rl-accent">
              {t('brand')}
            </span>
          </span>
        </AppLink>

        <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
          <StatusBar />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
