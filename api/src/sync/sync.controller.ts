import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/auth.decorators';
import { SyncPushDto } from './dto/sync-push.dto';
import { SyncPushResultDto } from './dto/sync-push-result.dto';
import { SyncService } from './sync.service';

@ApiTags('sync')
@Public()
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('push')
  @ApiOperation({
    summary: 'Recibir cola de sincronización offline desde dispositivos',
  })
  push(@Body() dto: SyncPushDto): Promise<SyncPushResultDto> {
    return this.syncService.push(dto);
  }
}
