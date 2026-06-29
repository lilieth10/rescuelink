export const ENTITY_TYPES = {
  MISSING_PERSON: 'missing_person',
} as const;

export type EntityType = (typeof ENTITY_TYPES)[keyof typeof ENTITY_TYPES];

export interface SyncPushItem {
  entityType: EntityType;
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: Record<string, unknown>;
}

export interface SyncPushRequest {
  clientId: string;
  items: SyncPushItem[];
}

export interface SyncItemResult {
  entityId: string;
  serverId?: string;
  status: 'SYNCED' | 'FAILED';
  error?: string;
}

export interface SyncPushResponse {
  results: SyncItemResult[];
  syncedCount: number;
  failedCount: number;
}
