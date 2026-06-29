import { Module } from '@nestjs/common';
import { MatchingModule } from '../matching/matching.module';
import { MissingPersonsController } from './missing-persons.controller';
import { MissingPersonsService } from './missing-persons.service';

@Module({
  imports: [MatchingModule],
  controllers: [MissingPersonsController],
  providers: [MissingPersonsService],
  exports: [MissingPersonsService],
})
export class MissingPersonsModule {}
