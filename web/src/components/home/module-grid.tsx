'use client';

import { useTranslations } from '@/lib/i18n/locale-provider';
import { ModuleCard } from './module-card';

const MODULES = [
  {
    href: '/missing-persons',
    titleKey: 'missingPersons.title',
    descriptionKey: 'missingPersons.description',
    available: true,
    icon: '🔍',
  },
  {
    href: '/found-persons',
    titleKey: 'foundPersons.title',
    descriptionKey: 'foundPersons.description',
    icon: '✓',
  },
  {
    href: '/protected-children',
    titleKey: 'protectedChildren.title',
    descriptionKey: 'protectedChildren.description',
    icon: '🛡️',
  },
  {
    href: '/shelters',
    titleKey: 'shelters.title',
    descriptionKey: 'shelters.description',
    icon: '🏠',
  },
  {
    href: '/humanitarian',
    titleKey: 'humanitarian.title',
    descriptionKey: 'humanitarian.description',
    icon: '📦',
  },
] as const;

export function ModuleGrid() {
  const t = useTranslations('home');

  return (
    <section className="mt-10 sm:mt-14">
      <div className="mb-6 max-w-2xl">
        <h2 className="text-2xl font-bold text-rl-navy sm:text-3xl">
          {t('modulesTitle')}
        </h2>
        <p className="mt-2 text-rl-text-muted">{t('modulesSubtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((module) => (
          <ModuleCard key={module.href} {...module} />
        ))}
      </div>
    </section>
  );
}
