import { db, type SyncOperation, type SyncStatus } from '@/lib/db/local-db';
import { getClientId } from '@/lib/sync/client-id';

interface EnqueueParams {
  entityType: string;
  entityId: string;
  operation: SyncOperation;
  payload: Record<string, unknown>;
}

export async function enqueueSync(params: EnqueueParams): Promise<void> {
  const existing = await db.syncQueue
    .where({ entityType: params.entityType, entityId: params.entityId })
    .filter((item) => item.status === 'PENDING' || item.status === 'FAILED')
    .first();

  if (existing?.id != null) {
    await db.syncQueue.update(existing.id, {
      operation: params.operation,
      payload: params.payload,
      status: 'PENDING',
      lastError: undefined,
    });
    return;
  }

  await db.syncQueue.add({
    clientId: getClientId(),
    entityType: params.entityType,
    entityId: params.entityId,
    operation: params.operation,
    payload: params.payload,
    status: 'PENDING',
    attempts: 0,
    createdAt: new Date(),
  });
}

export async function getPendingItems() {
  return db.syncQueue
    .where('status')
    .anyOf(['PENDING', 'FAILED'])
    .sortBy('createdAt');
}

export async function getPendingCount(): Promise<number> {
  return db.syncQueue.where('status').anyOf(['PENDING', 'FAILED']).count();
}

export async function markItemStatus(
  id: number,
  status: SyncStatus,
  error?: string,
): Promise<void> {
  await db.syncQueue.update(id, {
    status,
    lastError: error,
    syncedAt: status === 'SYNCED' ? new Date() : undefined,
    attempts: status === 'FAILED' ? undefined : undefined,
  });

  if (status === 'FAILED') {
    const item = await db.syncQueue.get(id);
    if (item) {
      await db.syncQueue.update(id, { attempts: item.attempts + 1 });
    }
  }
}

export async function markItemSynced(id: number): Promise<void> {
  await db.syncQueue.update(id, {
    status: 'SYNCED',
    syncedAt: new Date(),
    lastError: undefined,
  });
}
