'use client';

import { useTranslations } from '@/lib/i18n/locale-provider';

export function SiteFooter() {
  const t = useTranslations('common');

  return (
    <footer className="mt-auto border-t border-rl-border bg-rl-surface">
      <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-rl-text-muted sm:px-6">
        <p>
          <span className="font-semibold text-rl-navy">{t('brand')}</span>
          {' — '}
          {t('openSource')}
        </p>
      </div>
    </footer>
  );
}
