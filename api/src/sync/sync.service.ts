import { Inject, Injectable, Logger } from '@nestjs/common';
import { Prisma, SyncStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SyncPushDto } from './dto/sync-push.dto';
import { SyncItemResultDto, SyncPushResultDto } from './dto/sync-push-result.dto';
import {
  ENTITY_SYNC_HANDLERS,
  EntitySyncHandler,
} from './handlers/entity-sync-handler.interface';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private readonly handlerMap: Map<string, EntitySyncHandler>;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(ENTITY_SYNC_HANDLERS)
    handlers: EntitySyncHandler[],
  ) {
    this.handlerMap = new Map(
      handlers.map((handler) => [handler.entityType, handler]),
    );
  }

  async push(dto: SyncPushDto): Promise<SyncPushResultDto> {
    const results: SyncItemResultDto[] = [];

    for (const item of dto.items) {
      const result = await this.processItem(dto.clientId, item);
      results.push(result);
    }

    const syncedCount = results.filter((r) => r.status === 'SYNCED').length;
    const failedCount = results.length - syncedCount;

    return { results, syncedCount, failedCount };
  }

  private async processItem(
    deviceClientId: string,
    item: SyncPushDto['items'][number],
  ): Promise<SyncItemResultDto> {
    const handler = this.handlerMap.get(item.entityType);

    if (!handler) {
      return {
        entityId: item.entityId,
        status: 'FAILED',
        error: `Tipo de entidad no soportado: ${item.entityType}`,
      };
    }

    await this.recordQueueItem(deviceClientId, item, SyncStatus.IN_PROGRESS);

    const result = await handler.process(item, deviceClientId);

    await this.finalizeQueueItem(deviceClientId, item, result);

    return result;
  }

  private async recordQueueItem(
    deviceClientId: string,
    item: SyncPushDto['items'][number],
    status: SyncStatus,
  ): Promise<void> {
    const existing = await this.prisma.syncQueue.findFirst({
      where: {
        clientId: deviceClientId,
        entityType: item.entityType,
        entityId: item.entityId,
        operation: item.operation,
        status: { in: [SyncStatus.PENDING, SyncStatus.FAILED] },
      },
    });

    if (existing) {
      await this.prisma.syncQueue.update({
        where: { id: existing.id },
        data: {
          status,
          attempts: { increment: 1 },
          payload: item.payload as Prisma.InputJsonValue,
        },
      });
      return;
    }

    await this.prisma.syncQueue.create({
      data: {
        clientId: deviceClientId,
        entityType: item.entityType,
        entityId: item.entityId,
        operation: item.operation,
        payload: item.payload as Prisma.InputJsonValue,
        status,
      },
    });
  }

  private async finalizeQueueItem(
    deviceClientId: string,
    item: SyncPushDto['items'][number],
    result: SyncItemResultDto,
  ): Promise<void> {
    const record = await this.prisma.syncQueue.findFirst({
      where: {
        clientId: deviceClientId,
        entityType: item.entityType,
        entityId: item.entityId,
        operation: item.operation,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) return;

    if (result.status === 'SYNCED') {
      await this.prisma.syncQueue.update({
        where: { id: record.id },
        data: {
          status: SyncStatus.SYNCED,
          syncedAt: new Date(),
          lastError: null,
        },
      });
      return;
    }

    await this.prisma.syncQueue.update({
      where: { id: record.id },
      data: {
        status: SyncStatus.FAILED,
        lastError: result.error,
      },
    });

    this.logger.warn(
      `Sync failed for ${item.entityType}/${item.entityId}: ${result.error}`,
    );
  }
}
