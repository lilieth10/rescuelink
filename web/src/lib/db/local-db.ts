import Dexie, { type EntityTable } from 'dexie';

export type SyncOperation = 'CREATE' | 'UPDATE' | 'DELETE';
export type SyncStatus = 'PENDING' | 'IN_PROGRESS' | 'SYNCED' | 'FAILED';

export interface SyncQueueItem {
  id?: number;
  clientId: string;
  entityType: string;
  entityId: string;
  operation: SyncOperation;
  payload: Record<string, unknown>;
  status: SyncStatus;
  attempts: number;
  lastError?: string;
  createdAt: Date;
  syncedAt?: Date;
}

export interface LocalMissingPerson {
  id: string;
  serverId?: string;
  emergencyId: string;
  name: string;
  age?: number;
  sex: string;
  lastKnownLocation: string;
  familyContact?: string;
  physicalDescription?: string;
  clothing?: string;
  status: string;
  syncStatus: SyncStatus;
  updatedAt: Date;
  createdAt: Date;
}

class RescueLinkDB extends Dexie {
  syncQueue!: EntityTable<SyncQueueItem, 'id'>;
  missingPersons!: EntityTable<LocalMissingPerson, 'id'>;

  constructor() {
    super('RescueLinkDB');

    this.version(1).stores({
      syncQueue: '++id, clientId, status, entityType, createdAt',
      missingPersons: 'id, emergencyId, status, syncStatus, updatedAt',
    });

    this.version(2).stores({
      syncQueue: '++id, clientId, status, entityType, entityId, createdAt',
      missingPersons:
        'id, serverId, emergencyId, status, syncStatus, updatedAt, name, lastKnownLocation',
    });
  }
}

export const db = new RescueLinkDB();
