import { Module } from '@nestjs/common';
import { MissingPersonsModule } from '../missing-persons/missing-persons.module';
import { ENTITY_SYNC_HANDLERS } from './handlers/entity-sync-handler.interface';
import { MissingPersonSyncHandler } from './handlers/missing-person-sync.handler';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

@Module({
  imports: [MissingPersonsModule],
  controllers: [SyncController],
  providers: [
    SyncService,
    MissingPersonSyncHandler,
    {
      provide: ENTITY_SYNC_HANDLERS,
      useFactory: (missingPersonHandler: MissingPersonSyncHandler) => [
        missingPersonHandler,
      ],
      inject: [MissingPersonSyncHandler],
    },
  ],
  exports: [SyncService],
})
export class SyncModule {}
