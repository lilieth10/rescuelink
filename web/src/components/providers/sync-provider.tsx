'use client';

import { useSyncManager } from '@/hooks/use-sync-manager';
import type { ReactNode } from 'react';

export function SyncProvider({ children }: { children: ReactNode }) {
  useSyncManager();
  return children;
}
