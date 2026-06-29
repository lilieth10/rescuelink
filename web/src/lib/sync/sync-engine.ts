import { apiFetch } from '@/lib/api/client';
import { db } from '@/lib/db/local-db';
import { ENTITY_TYPES } from '@/lib/sync/sync-types';
import type { SyncPushRequest, SyncPushResponse } from '@/lib/sync/sync-types';
import {
  getPendingItems,
  markItemSynced,
} from '@/lib/sync/sync-queue';
import { getClientId, isOnline } from '@/lib/sync/client-id';

const MAX_BATCH_SIZE = 20;

export async function pushSyncQueue(): Promise<SyncPushResponse | null> {
  if (!isOnline()) return null;

  const pending = await getPendingItems();
  if (pending.length === 0) return null;

  const batch = pending.slice(0, MAX_BATCH_SIZE);

  const request: SyncPushRequest = {
    clientId: getClientId(),
    items: batch.map((item) => ({
      entityType: item.entityType as SyncPushRequest['items'][number]['entityType'],
      entityId: item.entityId,
      operation: item.operation,
      payload: item.payload,
    })),
  };

  const response = await apiFetch<SyncPushResponse>('/sync/push', {
    method: 'POST',
    body: JSON.stringify(request),
    cache: 'no-store',
  });

  for (const result of response.results) {
    const queueItem = batch.find((item) => item.entityId === result.entityId);
    if (!queueItem?.id) continue;

    if (result.status === 'SYNCED') {
      await markItemSynced(queueItem.id);

      if (
        queueItem.entityType === ENTITY_TYPES.MISSING_PERSON &&
        result.serverId
      ) {
        await db.missingPersons.update(queueItem.entityId, {
          serverId: result.serverId,
          syncStatus: 'SYNCED',
          status: 'SEARCHING',
          updatedAt: new Date(),
        });
      }
      continue;
    }

    await db.syncQueue.update(queueItem.id, {
      status: 'FAILED',
      lastError: result.error,
      attempts: queueItem.attempts + 1,
    });

    await db.missingPersons.update(queueItem.entityId, {
      syncStatus: 'FAILED',
      updatedAt: new Date(),
    });
  }

  return response;
}

export async function runSyncCycle(): Promise<void> {
  if (!isOnline()) return;

  let hasMore = true;

  while (hasMore) {
    const before = await getPendingItems();
    if (before.length === 0) {
      hasMore = false;
      break;
    }

    await pushSyncQueue();

    const after = await getPendingItems();
    hasMore = after.length > 0 && after.length < before.length;
  }
}
