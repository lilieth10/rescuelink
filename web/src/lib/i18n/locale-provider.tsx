'use client';

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import type { Locale } from './config';
import {
  createNamespaceTranslator,
  createTranslator,
  type Messages,
} from './get-dictionary';

interface LocaleContextValue {
  locale: Locale;
  messages: Messages;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  messages,
  children,
}: LocaleContextValue & { children: ReactNode }) {
  const value = useMemo(() => ({ locale, messages }), [locale, messages]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useTranslations(namespace?: string) {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error('useTranslations must be used within LocaleProvider');
  }

  return useMemo(() => {
    if (namespace) {
      return createNamespaceTranslator(context.messages, namespace);
    }
    return createTranslator(context.messages);
  }, [context.messages, namespace]);
}

export function useLocale(): Locale {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within LocaleProvider');
  return context.locale;
}
