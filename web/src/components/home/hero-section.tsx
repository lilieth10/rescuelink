'use client';

import { useTranslations } from '@/lib/i18n/locale-provider';

export function HeroSection() {
  const t = useTranslations('home');

  return (
    <section className="relative overflow-hidden rounded-2xl border border-rl-border bg-gradient-to-br from-rl-navy via-[#254a73] to-rl-navy px-6 py-10 text-white shadow-lg sm:px-10 sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-rl-accent/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-8 left-1/3 h-32 w-32 rounded-full bg-white/10 blur-2xl"
      />
      <div className="relative max-w-2xl">
        <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
          {t('heroTitle')}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-white/85 sm:text-lg">
          {t('heroSubtitle')}
        </p>
      </div>
    </section>
  );
}
