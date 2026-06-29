import { Injectable } from '@nestjs/common';
import { SyncOperation } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { CreateMissingPersonDto } from '../../missing-persons/dto/create-missing-person.dto';
import { MissingPersonsService } from '../../missing-persons/missing-persons.service';
import { SyncItemDto } from '../dto/sync-push.dto';
import { SyncItemResultDto } from '../dto/sync-push-result.dto';
import { EntitySyncHandler } from './entity-sync-handler.interface';

@Injectable()
export class MissingPersonSyncHandler implements EntitySyncHandler {
  readonly entityType = 'missing_person';

  constructor(private readonly missingPersonsService: MissingPersonsService) {}

  async process(
    item: SyncItemDto,
    _deviceClientId: string,
  ): Promise<SyncItemResultDto> {
    if (item.operation !== SyncOperation.CREATE) {
      return {
        entityId: item.entityId,
        status: 'FAILED',
        error: `Operación ${item.operation} no soportada para missing_person`,
      };
    }

    try {
      const dto = await this.parsePayload(item.payload, item.entityId);
      const created = await this.missingPersonsService.createFromSync(dto);

      return {
        entityId: item.entityId,
        serverId: created.id,
        status: 'SYNCED',
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';

      return {
        entityId: item.entityId,
        status: 'FAILED',
        error: message,
      };
    }
  }

  private async parsePayload(
    payload: Record<string, unknown>,
    entityId: string,
  ): Promise<CreateMissingPersonDto> {
    const dto = plainToInstance(CreateMissingPersonDto, {
      ...payload,
      clientId: entityId,
    });

    await validateOrReject(dto);
    return dto;
  }
}
