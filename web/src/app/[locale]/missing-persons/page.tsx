import { AppLink } from '@/lib/i18n/navigation';
import {
  createNamespaceTranslator,
  getDictionary,
} from '@/lib/i18n/get-dictionary';
import { isValidLocale } from '@/lib/i18n/config';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { MissingPersonsView } from '@/components/missing-persons/missing-persons-view';

export default async function MissingPersonsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getDictionary(isValidLocale(locale) ? locale : 'es');
  const t = createNamespaceTranslator(messages, 'missingPersons');
  const tCommon = createNamespaceTranslator(messages, 'common');

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <AppLink
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-rl-accent hover:text-rl-accent-hover"
        >
          ← {tCommon('backHome')}
        </AppLink>

        <header className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-bold text-rl-navy sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-3 text-lg text-rl-text-muted">{t('subtitle')}</p>
        </header>

        <MissingPersonsView />
      </main>

      <SiteFooter />
    </div>
  );
}
