import type { MatchHint, MissingPerson } from '@/lib/api/missing-persons';
import { db, type LocalMissingPerson, type SyncStatus } from '@/lib/db/local-db';
import { ENTITY_TYPES } from '@/lib/sync/sync-types';
import { enqueueSync } from '@/lib/sync/sync-queue';

export interface CreateLocalMissingPersonInput {
  emergencyId: string;
  name: string;
  age?: number;
  lastKnownLocation: string;
  familyContact?: string;
  physicalDescription?: string;
  clothing?: string;
}

export interface MissingPersonListItem {
  id: string;
  serverId?: string;
  clientId?: string;
  emergencyId: string;
  name: string;
  age: number | null;
  lastKnownLocation: string;
  familyContact: string | null;
  physicalDescription: string | null;
  status: string;
  matchHints?: MatchHint[];
  syncStatus: SyncStatus;
  isLocalOnly: boolean;
  createdAt: string;
}

function generateLocalId(): string {
  return crypto.randomUUID();
}

export function buildPersonFingerprint(input: {
  name: string;
  lastKnownLocation: string;
  age?: number | null;
  familyContact?: string | null;
}): string {
  const name = input.name.trim().toLowerCase();
  const location = input.lastKnownLocation.trim().toLowerCase();
  const age = input.age ?? 'unknown';
  const contact = input.familyContact?.trim().toLowerCase() ?? '';
  return `${name}|${location}|${age}|${contact}`;
}

export interface CreateMissingPersonResult {
  record: LocalMissingPerson;
  alreadyExists: boolean;
}

export function findDuplicateByFingerprint(
  items: Array<{
    name: string;
    lastKnownLocation: string;
    age?: number | null;
    familyContact?: string | null;
  }>,
  input: CreateLocalMissingPersonInput,
): boolean {
  const fingerprint = buildPersonFingerprint(input);
  return items.some((item) => buildPersonFingerprint(item) === fingerprint);
}

export async function createLocalMissingPerson(
  input: CreateLocalMissingPersonInput,
): Promise<CreateMissingPersonResult> {
  const fingerprint = buildPersonFingerprint(input);

  const existing = await db.missingPersons
    .filter((record) => buildPersonFingerprint(record) === fingerprint)
    .first();

  if (existing) {
    return { record: existing, alreadyExists: true };
  }

  const id = generateLocalId();
  const now = new Date();

  const record: LocalMissingPerson = {
    id,
    emergencyId: input.emergencyId,
    name: input.name.trim(),
    age: input.age,
    sex: 'UNKNOWN',
    lastKnownLocation: input.lastKnownLocation.trim(),
    familyContact: input.familyContact?.trim(),
    physicalDescription: input.physicalDescription?.trim(),
    clothing: input.clothing?.trim(),
    status: 'SEARCHING',
    syncStatus: 'PENDING',
    createdAt: now,
    updatedAt: now,
  };

  await db.missingPersons.put(record);

  await enqueueSync({
    entityType: ENTITY_TYPES.MISSING_PERSON,
    entityId: id,
    operation: 'CREATE',
    payload: {
      emergencyId: input.emergencyId,
      name: record.name,
      age: record.age,
      lastKnownLocation: record.lastKnownLocation,
      familyContact: record.familyContact,
      physicalDescription: record.physicalDescription,
      clothing: record.clothing,
    },
  });

  return { record, alreadyExists: false };
}

export async function getLocalMissingPersons(
  emergencyId: string,
  search?: string,
): Promise<MissingPersonListItem[]> {
  const records = await db.missingPersons
    .where('emergencyId')
    .equals(emergencyId)
    .reverse()
    .sortBy('updatedAt');

  const normalizedSearch = search?.trim().toLowerCase();

  return records
    .filter((record) => {
      if (!normalizedSearch) return true;
      return (
        record.name.toLowerCase().includes(normalizedSearch) ||
        record.lastKnownLocation.toLowerCase().includes(normalizedSearch)
      );
    })
    .map(toListItem);
}

export function mergeMissingPersonLists(
  remote: MissingPerson[],
  local: MissingPersonListItem[],
): MissingPersonListItem[] {
  const remoteByServerId = new Map(remote.map((person) => [person.id, person]));
  const remoteFingerprints = new Set(
    remote.map((person) =>
      buildPersonFingerprint({
        name: person.name,
        lastKnownLocation: person.lastKnownLocation,
        age: person.age,
        familyContact: person.familyContact,
      }),
    ),
  );

  const localItems = local
    .filter((person) => {
      if (person.serverId && remoteByServerId.has(person.serverId)) {
        return false;
      }

      const fingerprint = buildPersonFingerprint(person);
      if (person.syncStatus === 'SYNCED' && remoteFingerprints.has(fingerprint)) {
        return false;
      }

      return true;
    })
    .map((person) => ({ ...person, isLocalOnly: !person.serverId }));

  const remoteItems: MissingPersonListItem[] = remote.map((person) => ({
    id: person.id,
    serverId: person.id,
    clientId: person.clientId ?? undefined,
    emergencyId: person.emergencyId,
    name: person.name,
    age: person.age,
    lastKnownLocation: person.lastKnownLocation,
    familyContact: person.familyContact,
    physicalDescription: person.physicalDescription,
    status: person.status,
    matchHints: person.matchHints,
    syncStatus: 'SYNCED',
    isLocalOnly: false,
    createdAt: person.createdAt,
  }));

  const seenFingerprints = new Set<string>();
  const merged: MissingPersonListItem[] = [];

  for (const item of [...localItems, ...remoteItems]) {
    const fingerprint = buildPersonFingerprint(item);
    if (seenFingerprints.has(fingerprint)) continue;
    seenFingerprints.add(fingerprint);
    merged.push(item);
  }

  return merged.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function toListItem(record: LocalMissingPerson): MissingPersonListItem {
  return {
    id: record.serverId ?? record.id,
    serverId: record.serverId,
    clientId: record.id,
    emergencyId: record.emergencyId,
    name: record.name,
    age: record.age ?? null,
    lastKnownLocation: record.lastKnownLocation,
    familyContact: record.familyContact ?? null,
    physicalDescription: record.physicalDescription ?? null,
    status: record.status,
    syncStatus: record.syncStatus,
    isLocalOnly: !record.serverId,
    createdAt: record.createdAt.toISOString(),
  };
}
