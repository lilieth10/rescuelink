import type { Locale } from './config';

export type Messages = typeof import('../../../messages/es.json');

export async function getDictionary(locale: Locale): Promise<Messages> {
  switch (locale) {
    case 'en':
      return (await import('../../../messages/en.json')).default;
    case 'es':
    default:
      return (await import('../../../messages/es.json')).default;
  }
}

type NestedKeyOf<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? NestedKeyOf<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`;
    }[keyof T & string]
  : never;

export type MessageKey = NestedKeyOf<Messages>;

function getNestedValue(
  messages: Messages,
  key: string,
): string | undefined {
  const value = key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, messages);

  return typeof value === 'string' ? value : undefined;
}

function formatMessage(
  template: string,
  values?: Record<string, string | number>,
): string {
  if (!values) return template;

  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key];
    return value !== undefined ? String(value) : `{${key}}`;
  });
}

export function createTranslator(messages: Messages) {
  return function t(
    key: string,
    values?: Record<string, string | number>,
  ): string {
    const message = getNestedValue(messages, key);
    if (!message) return key;
    return formatMessage(message, values);
  };
}

export function createNamespaceTranslator(
  messages: Messages,
  namespace: string,
) {
  const t = createTranslator(messages);
  return (key: string, values?: Record<string, string | number>) =>
    t(`${namespace}.${key}`, values);
}
