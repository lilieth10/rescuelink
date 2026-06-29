import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SyncItemResultDto {
  @ApiProperty()
  entityId!: string;

  @ApiPropertyOptional()
  serverId?: string;

  @ApiProperty({ enum: ['SYNCED', 'FAILED'] })
  status!: 'SYNCED' | 'FAILED';

  @ApiPropertyOptional()
  error?: string;
}

export class SyncPushResultDto {
  @ApiProperty({ type: [SyncItemResultDto] })
  results!: SyncItemResultDto[];

  @ApiProperty()
  syncedCount!: number;

  @ApiProperty()
  failedCount!: number;
}
