import { db, type SyncOperation } from '@/lib/db/local-db';
import { getClientId } from '@/lib/sync/client-id';

interface EnqueueParams {
  entityType: string;
  entityId: string;
  operation: SyncOperation;
  payload: Record<string, unknown>;
}

export async function enqueueSync(params: EnqueueParams): Promise<void> {
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

export async function getPendingCount(): Promise<number> {
  return db.syncQueue.where('status').equals('PENDING').count();
}
