import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';
import { Providers } from '@/components/providers';
import { isValidLocale, locales } from '@/lib/i18n/config';
import {
  createNamespaceTranslator,
  getDictionary,
} from '@/lib/i18n/get-dictionary';
import { LocaleProvider } from '@/lib/i18n/locale-provider';
import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getDictionary(
    isValidLocale(locale) ? locale : 'es',
  );
  const t = createNamespaceTranslator(messages, 'metadata');

  return {
    title: t('title'),
    description: t('description'),
    manifest: '/manifest.json',
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const messages = await getDictionary(locale);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-rl-bg text-rl-text">
        <LocaleProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </LocaleProvider>
      </body>
    </html>
  );
}
