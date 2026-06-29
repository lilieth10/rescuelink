import { SyncItemDto } from '../dto/sync-push.dto';
import { SyncItemResultDto } from '../dto/sync-push-result.dto';

export interface EntitySyncHandler {
  readonly entityType: string;
  process(item: SyncItemDto, deviceClientId: string): Promise<SyncItemResultDto>;
}

export const ENTITY_SYNC_HANDLERS = Symbol('ENTITY_SYNC_HANDLERS');
