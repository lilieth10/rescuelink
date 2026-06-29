import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SyncOperation } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class SyncItemDto {
  @ApiProperty({ example: 'missing_person' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  entityType!: string;

  @ApiProperty({ description: 'Local entity UUID from the device' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  entityId!: string;

  @ApiProperty({ enum: SyncOperation })
  @IsEnum(SyncOperation)
  operation!: SyncOperation;

  @ApiProperty({ description: 'Entity payload' })
  @IsObject()
  payload!: Record<string, unknown>;
}

export class SyncPushDto {
  @ApiProperty({ description: 'Device installation UUID' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  clientId!: string;

  @ApiProperty({ type: [SyncItemDto] })
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => SyncItemDto)
  items!: SyncItemDto[];
}
