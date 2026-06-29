'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { type Locale, locales } from '@/lib/i18n/config';
import { useTranslations } from '@/lib/i18n/locale-provider';

export function LanguageSwitcher() {
  const t = useTranslations('language');
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const locale = (params?.locale as Locale | undefined) ?? 'es';

  function switchLocale(nextLocale: Locale) {
    document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=31536000`;

    const segments = pathname.split('/');
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = nextLocale;
      router.push(segments.join('/') || `/${nextLocale}`);
      return;
    }

    router.push(`/${nextLocale}${pathname}`);
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-rl-border bg-rl-surface-muted p-1">
      <span className="sr-only">{t('label')}</span>
      {locales.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => switchLocale(code)}
          aria-pressed={locale === code}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            locale === code
              ? 'bg-rl-navy text-white shadow-sm'
              : 'text-rl-text-muted hover:bg-rl-surface hover:text-rl-text'
          }`}
        >
          {t(code)}
        </button>
      ))}
    </div>
  );
}
