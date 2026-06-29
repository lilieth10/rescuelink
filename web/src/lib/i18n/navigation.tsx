'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { ComponentProps } from 'react';
import { type Locale } from './config';

type AppLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
};

export function AppLink({ href, ...props }: AppLinkProps) {
  const params = useParams();
  const locale = (params?.locale as Locale | undefined) ?? 'es';
  const localizedHref = href.startsWith('/')
    ? `/${locale}${href}`
    : href;

  return <Link href={localizedHref} {...props} />;
}
